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
    end
  end
end
