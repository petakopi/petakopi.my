Rails.application.routes.draw do
  devise_for :users

  authenticate :user, ->(user) { user.admin? } do
    require "sidekiq/web"

    mount Sidekiq::Web => "/sidekiq"
  end

  namespace :admin do
    resources :coffee_shops
  end

  resources :coffee_shops, only: [:index, :show, :new, :create]
  resources :locations do
    collection do
      get :cities
    end
  end

  get "about" => "pages#about"
  get "coffee_map" => "pages#coffee_map"
  get "map" => "map#index"

  namespace :api do
    namespace :v1 do
      resources :coffee_shops, only: [:index]
    end
  end

  direct :rails_public_blob do |blob|
    if  blob.signed_id.nil?
      ""
    elsif Rails.env.development? || Rails.env.test?
      route_for(:rails_blob, blob)
    else
      File.join("https://assets.petakopi.my", blob.key)
    end
  end

  root "coffee_shops#index"
end
