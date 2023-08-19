module OpeningHoursHelper
  def opening_hour_status_text(text)
    case text
    when "Open"
      content_tag(:span, text, class: "text-green-700")
    when "Closed"
      content_tag(:span, text, class: "text-red-700")
    when "Closing soon"
      content_tag(:span, text, class: "text-yellow-700")
    when "Opening soon"
      content_tag(:span, text, class: "text-yellow-700")
    when "Closed for today"
      content_tag(:span, text, class: "text-red-700")
    else
      content_tag(:span, text, class: "text-gray-700")
    end
  end
end
