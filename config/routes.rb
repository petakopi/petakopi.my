Rails.application.routes.draw do
  resources :coffee_shops
  devise_for :users

  get "home/index"

  root "home#index"
end
