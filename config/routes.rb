Rails.application.routes.draw do
  devise_for :users

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

  root "coffee_shops#index"
end
