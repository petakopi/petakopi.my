Rails.application.routes.draw do
  devise_for :users

  resources :coffee_shops
  resources :locations do
    collection do
      get :cities
    end
  end

  get "home/index"

  root "home#index"
end
