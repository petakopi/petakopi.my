require "tinify"

Tinify.key = Rails.application.credentials.dig(:tinify, :key) 
