Rails.application.routes.draw do
  devise_for :users

  resources :coffee_shops, only: [:index, :show, :new, :create]
  resources :locations do
    collection do
      get :cities
    end
  end

  root "coffee_shops#index"
end
