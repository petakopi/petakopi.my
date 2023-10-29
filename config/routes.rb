Rails.application.routes.draw do
  devise_for :users, controllers: {omniauth_callbacks: "users/omniauth_callbacks"}

  authenticate :user, ->(user) { user.admin? } do
    require "sidekiq/web"

    mount Sidekiq::Web => "/sidekiq"
  end

  namespace :admin do
    resources :coffee_shops do
      member do
        post "duplicate"
        post "sync_opening_hours"
      end
    end
  end

  namespace :business do
    resources :coffee_shops, only: [:index, :edit, :update] do
      member do
        get "stats"
      end
    end
  end

  get "directories/:state(/:district)" => "directories#index", :as => "directories"

  resources :locations do
    collection do
      get :cities
    end
  end

  get "about" => "pages#about"
  get "privacy" => "pages#privacy"
  get "terms" => "pages#terms"
  get "map" => "map#index"

  namespace :api do
    namespace :v1 do
      resources :coffee_shops, only: [:index, :show]
    end
  end

  direct :rails_public_blob do |blob|
    if blob.signed_id.nil?
      ""
    elsif Rails.env.development? || Rails.env.test?
      route_for(:rails_blob, blob)
    else
      File.join("https://assets.petakopi.my", blob.key)
    end
  end

  resources :coffee_shops, only: [:new, :create, :edit, :update, :index] do
    resource :location, only: [:edit, :update], module: :coffee_shops
    resource :opening_hours, only: [:edit, :update], module: :coffee_shops
    resource :analytics, only: [:show], module: :coffee_shops

    resources :favourites, only: [:create, :destroy]
    resources :check_ins, only: [:create]
    resources :reports, only: [:new, :create]
  end
  resources :coffee_shops_v2, only: [:new, :create]
  resources :users, path: "u", only: [:show, :edit, :update]

  get "/coffee_shops/:id", to: redirect("/%{id}", status: 301)
  get "/cs/:id", to: redirect("/%{id}", status: 301)
  get "/new", to: "coffee_shops_v2#new", as: "new_coffee_shop_v2"

  constraints CoffeeShopConstraint.new do
    resources :coffee_shops, path: "", only: [:show], as: "main_coffee_shop"
  end

  root "home#index"
end
