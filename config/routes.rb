Rails.application.routes.draw do
  get "up" => "health#show", :as => :health_check

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
        post "update_locality"
      end
    end
    resources :coffee_shop_owners, only: [:index, :new, :create, :destroy]
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
  get "mapbox" => "mapbox#index", :defaults => {format: :json}

  namespace :api, defaults: {format: :json} do
    namespace :v1 do
      resources :coffee_shops, only: [:index, :show]
      resources :maps, only: [:index]
    end
  end

  direct :rails_public_blob do |blob|
    if (blob.persisted? && blob.signed_id.nil?) || blob.key.nil?
      ""
    elsif Rails.env.development? || Rails.env.test?
      route_for(:rails_blob, blob)
    else
      File.join("https://assets.petakopi.my", blob.key)
    end
  end

  resources :auctions, only: [:index, :show] do
    resources :bids, only: [:new, :create]
  end

  resources :coffee_shops, only: [:edit, :update, :index] do
    # For business owners
    resource :location, only: [:edit, :update], module: :coffee_shops
    resource :opening_hours, only: [:edit, :update], module: :coffee_shops
    resource :analytics, only: [:show], module: :coffee_shops
    resources :feedbacks, only: [:index, :show], module: :coffee_shops

    # For users
    resources :reports, only: [:new, :create]
    resources :tell_managers, only: [:new, :create]
  end
  resources :bookmarks, only: [:new, :edit, :update, :create, :destroy]
  resources :coffee_shops_v2, only: [:new, :create]
  resources :collections, only: [:new, :create, :edit, :update, :destroy]
  resources :users, path: "u", only: [:show, :edit, :update] do
    resources :bookmarks, only: [:index], controller: "users/bookmarks"
  end
  # Declare outside to prevent conflict with /u/:username/[edit|update]
  get "u/:user_id/:collection_slug", to: "users/collections#show", as: :user_collection

  resources :inbox, only: [:index, :show]

  get "/coffee_shops/:id", to: redirect("/%{id}", status: 301)
  get "/cs/:id", to: redirect("/%{id}", status: 301)
  get "/new", to: "coffee_shops_v2#new", as: "new_coffee_shop_v2"

  constraints CoffeeShopConstraint.new do
    resources :coffee_shops, path: "", only: [:show], as: "main_coffee_shop"
  end

  root "home#index"
end
