require "rails_helper"

RSpec.describe OpeningHoursPresenter do
  context "with multiple opening hours per day" do
    it "returns the right opening hours" do
      opening_hours = [
        build(
          :opening_hour,
          start_day: 6,
          start_time: 2000,
          close_day: 0,
          close_time: 0
        ),
        build(
          :opening_hour,
          start_day: 6,
          start_time: 730,
          close_day: 6,
          close_time: 1700
        ),
        build(
          :opening_hour,
          start_day: 5,
          start_time: 730,
          close_day: 5,
          close_time: 830
        )
      ]

      output = OpeningHoursPresenter.new(opening_hours).list

      expect(output.count).to eq(8)
      expect(output[5][:display_day]).to eq("Friday")
      expect(output[6][:display_day]).to eq("Saturday")
      expect(output[7][:display_day]).to eq(nil)
      expect(output[7][:start_day]).to eq("Saturday")
      expect(output[6][:start_time]).to eq("7:30 AM")
      expect(output[7][:start_time]).to eq("8:00 PM")
    end
  end

  context "with days sorted by earliest time" do
    it "sorts each day's hours by start time" do
      opening_hours = [
        build(
          :opening_hour,
          start_day: 0, # Sunday
          start_time: 1700,
          close_day: 0,
          close_time: 2200
        ),
        build(
          :opening_hour,
          start_day: 0, # Sunday
          start_time: 800,
          close_day: 0,
          close_time: 1200
        ),
        build(
          :opening_hour,
          start_day: 1, # Monday
          start_time: 1700,
          close_day: 1,
          close_time: 2200
        ),
        build(
          :opening_hour,
          start_day: 1, # Monday
          start_time: 800,
          close_day: 1,
          close_time: 1200
        )
      ]

      output = OpeningHoursPresenter.new(opening_hours).list

      # Check that Sunday hours are sorted by time
      expect(output[0][:display_day]).to eq("Sunday")
      expect(output[0][:start_time]).to eq("8:00 AM")
      expect(output[1][:display_day]).to be_nil
      expect(output[1][:start_day]).to eq("Sunday")
      expect(output[1][:start_time]).to eq("5:00 PM")

      # Check that Monday hours are sorted by time
      expect(output[2][:display_day]).to eq("Monday")
      expect(output[2][:start_time]).to eq("8:00 AM")
      expect(output[3][:display_day]).to be_nil
      expect(output[3][:start_day]).to eq("Monday")
      expect(output[3][:start_time]).to eq("5:00 PM")
    end
  end
end
