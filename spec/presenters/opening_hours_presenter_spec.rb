require "rails_helper"

RSpec.describe OpeningHoursPresenter do
  let(:coffee_shop) { create(:coffee_shop) }
  let(:presenter) { described_class.new(opening_hours) }

  describe "#api_format_with_status" do
    context "when there are no opening hours" do
      let(:opening_hours) { [] }

      it "returns hours not listed status" do
        result = presenter.api_format_with_status

        expect(result[:opening_hours][:periods]).to be_empty
        expect(result[:opening_hours][:is_open]).to be false
        expect(result[:opening_hours][:current_status]).to eq("Hours not listed")
        expect(result[:opening_hours][:next_change]).to eq("")
        expect(result[:opening_hours][:today_hours]).to be_nil
        expect(result[:opening_hours][:current_time_slot]).to be_nil
      end
    end

    context "when shop is closed today" do
      let(:opening_hours) do
        # Create hours for all days except today
        current_day = Time.current.wday
        (0..6).map do |day|
          next if day == current_day
          create(:opening_hour,
            coffee_shop: coffee_shop,
            start_day: day,
            start_time: 800,
            close_time: 1700)
        end.compact
      end

      it "returns closed today status" do
        result = presenter.api_format_with_status

        expect(result[:opening_hours][:is_open]).to be false
        expect(result[:opening_hours][:current_status]).to eq("Closed today")
        expect(result[:opening_hours][:current_time_slot]).to eq("closed")
      end

      it "shows next open day" do
        result = presenter.api_format_with_status
        Time.current.wday

        expect(result[:opening_hours][:next_change]).to include("Opens tomorrow")
      end
    end

    context "when shop is currently open" do
      let(:opening_hours) do
        current_day = Time.current.wday
        [
          create(:opening_hour,
            coffee_shop: coffee_shop,
            start_day: current_day,
            start_time: 0, # Open from midnight
            close_time: 2359) # Until 11:59 PM
        ]
      end

      it "returns open status" do
        result = presenter.api_format_with_status

        expect(result[:opening_hours][:is_open]).to be true
        expect(result[:opening_hours][:current_status]).to eq("Open now")
        expect(result[:opening_hours][:current_time_slot]).to eq("open")
        expect(result[:opening_hours][:next_change]).to include("Closes at")
      end

      it "includes today's hours" do
        result = presenter.api_format_with_status

        expect(result[:opening_hours][:today_hours]).not_to be_nil
        expect(result[:opening_hours][:today_hours][:day_index]).to eq(Time.current.wday)
        expect(result[:opening_hours][:today_hours][:is_closed]).to be false
      end
    end

    context "when shop is closed but opens later today" do
      let(:opening_hours) do
        current_day = Time.current.wday
        future_time = (Time.current.hour + 2) * 100 # 2 hours from now

        [
          create(:opening_hour,
            coffee_shop: coffee_shop,
            start_day: current_day,
            start_time: future_time,
            close_time: 2300)
        ]
      end

      it "returns closed status with opening time" do
        result = presenter.api_format_with_status

        expect(result[:opening_hours][:is_open]).to be false
        expect(result[:opening_hours][:current_status]).to eq("Closed")
        expect(result[:opening_hours][:current_time_slot]).to eq("closed")
        expect(result[:opening_hours][:next_change]).to include("Opens at")
      end
    end

    context "when shop has multiple time slots per day" do
      let(:opening_hours) do
        current_day = Time.current.wday
        [
          # Morning slot
          create(:opening_hour,
            coffee_shop: coffee_shop,
            start_day: current_day,
            start_time: 800,
            close_time: 1200),
          # Afternoon slot
          create(:opening_hour,
            coffee_shop: coffee_shop,
            start_day: current_day,
            start_time: 1400,
            close_time: 2000)
        ]
      end

      it "includes all periods in the response" do
        result = presenter.api_format_with_status

        periods = result[:opening_hours][:periods]
        today_periods = periods.select do |p|
          p[:open][:day] == Date::DAYNAMES[Time.current.wday].upcase
        end

        expect(today_periods.length).to eq(2)
      end

      context "when current time is between slots" do
        before do
          # Set time to 1:00 PM (between morning and afternoon slots)
          allow(Time).to receive(:current).and_return(
            Time.zone.local(2024, 1, 15, 13, 0, 0) # Monday 1:00 PM
          )
        end

        it "shows as closed with next opening time" do
          result = presenter.api_format_with_status

          expect(result[:opening_hours][:is_open]).to be false
          expect(result[:opening_hours][:next_change]).to include("Opens at")
        end
      end
    end

    context "with real-world opening hours format" do
      let(:opening_hours) do
        # Simulate real data from database
        [
          create(:opening_hour,
            coffee_shop: coffee_shop,
            start_day: 1, # Monday
            start_time: 730,
            close_time: 1730),
          create(:opening_hour,
            coffee_shop: coffee_shop,
            start_day: 2, # Tuesday
            start_time: 730,
            close_time: 1730),
          create(:opening_hour,
            coffee_shop: coffee_shop,
            start_day: 3, # Wednesday
            start_time: 730,
            close_time: 1730),
          create(:opening_hour,
            coffee_shop: coffee_shop,
            start_day: 4, # Thursday
            start_time: 730,
            close_time: 1730),
          create(:opening_hour,
            coffee_shop: coffee_shop,
            start_day: 5, # Friday - with prayer break
            start_time: 730,
            close_time: 1200),
          create(:opening_hour,
            coffee_shop: coffee_shop,
            start_day: 5, # Friday - after prayer
            start_time: 1400,
            close_time: 1730),
          create(:opening_hour,
            coffee_shop: coffee_shop,
            start_day: 6, # Saturday
            start_time: 730,
            close_time: 1730)
        ]
      end

      it "formats periods correctly" do
        result = presenter.api_format_with_status

        periods = result[:opening_hours][:periods]
        expect(periods).not_to be_empty

        # Check Friday has two periods
        friday_periods = periods.select { |p| p[:open][:day] == "FRIDAY" }
        expect(friday_periods.length).to eq(2)

        # Check time format
        expect(friday_periods.first[:open][:time]).to eq("07:30")
        expect(friday_periods.first[:close][:time]).to eq("12:00")
        expect(friday_periods.last[:open][:time]).to eq("14:00")
        expect(friday_periods.last[:close][:time]).to eq("17:30")
      end

      context "on Monday at 10:00 AM" do
        before do
          allow(Time).to receive(:current).and_return(
            Time.zone.local(2024, 1, 15, 10, 0, 0) # Monday 10:00 AM
          )
        end

        it "shows as open" do
          result = presenter.api_format_with_status

          expect(result[:opening_hours][:is_open]).to be true
          expect(result[:opening_hours][:current_status]).to eq("Open now")
          expect(result[:opening_hours][:next_change]).to eq("Closes at 5:30 PM")
        end
      end

      context "on Friday during prayer break" do
        before do
          allow(Time).to receive(:current).and_return(
            Time.zone.local(2024, 1, 19, 12, 30, 0) # Friday 12:30 PM
          )
        end

        it "shows as closed with next opening time" do
          result = presenter.api_format_with_status

          expect(result[:opening_hours][:is_open]).to be false
          expect(result[:opening_hours][:current_status]).to eq("Closed")
          expect(result[:opening_hours][:next_change]).to eq("Opens at 2:00 PM")
        end
      end
    end
  end

  describe "#api_format" do
    let(:opening_hours) do
      [
        create(:opening_hour,
          coffee_shop: coffee_shop,
          start_day: 1,
          start_time: 900,
          close_time: 1700)
      ]
    end

    it "returns legacy business_hours format" do
      result = presenter.api_format

      expect(result).to have_key(:business_hours)
      expect(result[:business_hours]).to have_key(:periods)
      expect(result[:business_hours][:periods]).not_to be_empty
    end

    it "maintains backward compatibility" do
      result = presenter.api_format
      period = result[:business_hours][:periods].first

      expect(period[:open][:day]).to eq("MONDAY")
      expect(period[:open][:time]).to eq("09:00")
      expect(period[:close][:time]).to eq("17:00")
    end
  end

  describe "#list" do
    context "with partial week coverage" do
      let(:opening_hours) do
        [
          create(:opening_hour,
            coffee_shop: coffee_shop,
            start_day: 1,
            start_time: 900,
            close_time: 1700),
          create(:opening_hour,
            coffee_shop: coffee_shop,
            start_day: 3,
            start_time: 900,
            close_time: 1700)
        ]
      end

      it "fills in missing days with closed markers" do
        result = presenter.list

        expect(result.length).to eq(7)

        # Check closed days have proper markers
        closed_days = result.select { |h| h[:start_time] == "-" }
        expect(closed_days.length).to eq(5)
      end
    end
  end

  describe "midnight closing time bug reproduction" do
    context "with real-world data from Caffeine Chapters Cafe" do
      let(:opening_hours) do
        [
          # Monday-Thursday: 10:00 AM - 10:00 PM
          create(:opening_hour,
            coffee_shop: coffee_shop,
            start_day: 1, # Monday
            start_time: 1000,
            close_time: 2200),
          create(:opening_hour,
            coffee_shop: coffee_shop,
            start_day: 2, # Tuesday
            start_time: 1000,
            close_time: 2200),
          create(:opening_hour,
            coffee_shop: coffee_shop,
            start_day: 3, # Wednesday
            start_time: 1000,
            close_time: 2200),
          create(:opening_hour,
            coffee_shop: coffee_shop,
            start_day: 4, # Thursday
            start_time: 1000,
            close_time: 2200),
          # Friday: 2:30 PM - Midnight (00:00)
          create(:opening_hour,
            coffee_shop: coffee_shop,
            start_day: 5, # Friday
            start_time: 1430,
            close_time: 0), # 00:00 (midnight)
          # Saturday: 10:00 AM - Midnight (00:00)
          create(:opening_hour,
            coffee_shop: coffee_shop,
            start_day: 6, # Saturday
            start_time: 1000,
            close_time: 0) # 00:00 (midnight)
        ]
      end

      context "on Saturday at 8:00 PM (should be open until midnight)" do
        before do
          # Saturday, September 28, 2024 at 8:00 PM (20:00)
          travel_to Time.zone.local(2024, 9, 28, 20, 0, 0)
        end

        after do
          travel_back
        end

        it "should show as open until midnight" do
          result = presenter.api_format_with_status

          expect(result[:opening_hours][:is_open]).to be true
          expect(result[:opening_hours][:current_status]).to eq("Open now")
          expect(result[:opening_hours][:current_time_slot]).to eq("open")
          expect(result[:opening_hours][:next_change]).to include("Closes at")
        end

        it "should have correct today_hours" do
          result = presenter.api_format_with_status

          today_hours = result[:opening_hours][:today_hours]
          expect(today_hours[:day]).to eq("Saturday")
          expect(today_hours[:day_index]).to eq(6)
          expect(today_hours[:is_closed]).to be false
          expect(today_hours[:open_time]).to eq("10:00")
          expect(today_hours[:close_time]).to eq("00:00")
        end
      end

      context "on Friday at 8:00 PM (should be open until midnight)" do
        before do
          # Friday, September 27, 2024 at 8:00 PM (20:00)
          travel_to Time.zone.local(2024, 9, 27, 20, 0, 0)
        end

        after do
          travel_back
        end

        it "should show as open until midnight" do
          result = presenter.api_format_with_status

          expect(result[:opening_hours][:is_open]).to be true
          expect(result[:opening_hours][:current_status]).to eq("Open now")
          expect(result[:opening_hours][:current_time_slot]).to eq("open")
        end
      end

      context "on Saturday at 11:59 PM (should still be open)" do
        before do
          # Saturday, September 28, 2024 at 11:59 PM (23:59)
          travel_to Time.zone.local(2024, 9, 28, 23, 59, 0)
        end

        after do
          travel_back
        end

        it "should show as open (closes at midnight)" do
          result = presenter.api_format_with_status

          expect(result[:opening_hours][:is_open]).to be true
          expect(result[:opening_hours][:current_status]).to eq("Open now")
        end
      end

      context "on Sunday at 12:01 AM (should be closed)" do
        before do
          # Sunday, September 29, 2024 at 12:01 AM (00:01)
          travel_to Time.zone.local(2024, 9, 29, 0, 1, 0)
        end

        after do
          travel_back
        end

        it "should show as closed" do
          result = presenter.api_format_with_status

          expect(result[:opening_hours][:is_open]).to be false
          expect(result[:opening_hours][:current_status]).to eq("Closed today")
        end
      end
    end

    context "with after-midnight closing time bug reproduction" do
      context "with real-world data from Craft Cafe" do
        let(:opening_hours) do
          [
            # Sunday: 10:00 AM - Monday 1:00 AM (overnight)
            create(:opening_hour,
              coffee_shop: coffee_shop,
              start_day: 0, # Sunday
              start_time: 1000,
              close_day: 1, # Monday
              close_time: 100), # 1:00 AM
            # Monday: 10:00 AM - Tuesday 1:00 AM (overnight)
            create(:opening_hour,
              coffee_shop: coffee_shop,
              start_day: 1, # Monday
              start_time: 1000,
              close_day: 2, # Tuesday
              close_time: 100), # 1:00 AM
            # Tuesday: 10:00 AM - Wednesday 1:00 AM (overnight)
            create(:opening_hour,
              coffee_shop: coffee_shop,
              start_day: 2, # Tuesday
              start_time: 1000,
              close_day: 3, # Wednesday
              close_time: 100), # 1:00 AM
            # Thursday: 10:00 AM - Friday 1:00 AM (overnight)
            create(:opening_hour,
              coffee_shop: coffee_shop,
              start_day: 4, # Thursday
              start_time: 1000,
              close_day: 5, # Friday
              close_time: 100), # 1:00 AM
            # Friday: 10:00 AM - Saturday 1:00 AM (overnight)
            create(:opening_hour,
              coffee_shop: coffee_shop,
              start_day: 5, # Friday
              start_time: 1000,
              close_day: 6, # Saturday
              close_time: 100), # 1:00 AM
            # Saturday: 10:00 AM - Sunday 1:00 AM (overnight)
            create(:opening_hour,
              coffee_shop: coffee_shop,
              start_day: 6, # Saturday
              start_time: 1000,
              close_day: 0, # Sunday
              close_time: 100) # 1:00 AM
          ]
        end

        context "on Sunday at 11:00 PM (should be open until Monday 1:00 AM)" do
          before do
            # Sunday, September 29, 2024 at 11:00 PM (23:00)
            travel_to Time.zone.local(2024, 9, 29, 23, 0, 0)
          end

          after do
            travel_back
          end

          it "should show as open until 1:00 AM" do
            result = presenter.api_format_with_status

            expect(result[:opening_hours][:is_open]).to be true
            expect(result[:opening_hours][:current_status]).to eq("Open now")
            expect(result[:opening_hours][:current_time_slot]).to eq("open")
            expect(result[:opening_hours][:next_change]).to include("Closes at")
          end

          it "should have correct today_hours" do
            result = presenter.api_format_with_status

            today_hours = result[:opening_hours][:today_hours]
            expect(today_hours[:day]).to eq("Sunday")
            expect(today_hours[:day_index]).to eq(0)
            expect(today_hours[:is_closed]).to be false
            expect(today_hours[:open_time]).to eq("10:00")
            expect(today_hours[:close_time]).to eq("01:00")
          end
        end

        context "on Monday at 12:30 AM (should still be open from Sunday)" do
          before do
            # Monday, September 30, 2024 at 12:30 AM (00:30)
            travel_to Time.zone.local(2024, 9, 30, 0, 30, 0)
          end

          after do
            travel_back
          end

          it "should show as open (closing at 1:00 AM)" do
            result = presenter.api_format_with_status

            expect(result[:opening_hours][:is_open]).to be true
            expect(result[:opening_hours][:current_status]).to eq("Open now")
            expect(result[:opening_hours][:current_time_slot]).to eq("open")
          end
        end

        context "on Monday at 1:30 AM (should be closed)" do
          before do
            # Monday, September 30, 2024 at 1:30 AM (01:30)
            travel_to Time.zone.local(2024, 9, 30, 1, 30, 0)
          end

          after do
            travel_back
          end

          it "should show as closed (opened later at 10:00 AM)" do
            result = presenter.api_format_with_status

            expect(result[:opening_hours][:is_open]).to be false
            expect(result[:opening_hours][:current_status]).to eq("Closed")
            expect(result[:opening_hours][:current_time_slot]).to eq("closed")
            expect(result[:opening_hours][:next_change]).to eq("Opens at 10:00 AM")
          end
        end

        context "on Monday at 10:30 AM (should be open for Monday hours)" do
          before do
            # Monday, September 30, 2024 at 10:30 AM (10:30)
            travel_to Time.zone.local(2024, 9, 30, 10, 30, 0)
          end

          after do
            travel_back
          end

          it "should show as open (new day's hours)" do
            result = presenter.api_format_with_status

            expect(result[:opening_hours][:is_open]).to be true
            expect(result[:opening_hours][:current_status]).to eq("Open now")
            expect(result[:opening_hours][:current_time_slot]).to eq("open")
          end
        end
      end
    end
  end
end
