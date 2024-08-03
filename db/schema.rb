# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2024_07_27_153312) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pageinspect"
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "action_text_rich_texts", force: :cascade do |t|
    t.string "name", null: false
    t.text "body"
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["record_type", "record_id", "name"], name: "index_action_text_rich_texts_uniqueness", unique: true
  end

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "ahoy_events", force: :cascade do |t|
    t.bigint "visit_id"
    t.bigint "user_id"
    t.string "name"
    t.jsonb "properties"
    t.datetime "time"
    t.index ["name", "time"], name: "index_ahoy_events_on_name_and_time"
    t.index ["properties"], name: "index_ahoy_events_on_properties", opclass: :jsonb_path_ops, using: :gin
    t.index ["user_id"], name: "index_ahoy_events_on_user_id"
    t.index ["visit_id"], name: "index_ahoy_events_on_visit_id"
  end

  create_table "ahoy_visits", force: :cascade do |t|
    t.string "visit_token"
    t.string "visitor_token"
    t.bigint "user_id"
    t.string "ip"
    t.text "user_agent"
    t.text "referrer"
    t.string "referring_domain"
    t.text "landing_page"
    t.string "browser"
    t.string "os"
    t.string "device_type"
    t.string "country"
    t.string "region"
    t.string "city"
    t.float "latitude"
    t.float "longitude"
    t.string "utm_source"
    t.string "utm_medium"
    t.string "utm_term"
    t.string "utm_content"
    t.string "utm_campaign"
    t.string "app_version"
    t.string "os_version"
    t.string "platform"
    t.datetime "started_at"
    t.index ["user_id"], name: "index_ahoy_visits_on_user_id"
    t.index ["visit_token"], name: "index_ahoy_visits_on_visit_token", unique: true
  end

  create_table "auctions", force: :cascade do |t|
    t.string "title", null: false
    t.string "slug", null: false
    t.text "description", null: false
    t.decimal "minimum_amount", null: false
    t.datetime "start_at", null: false
    t.datetime "end_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_auctions_on_slug", unique: true
    t.index ["title"], name: "index_auctions_on_title", unique: true
  end

  create_table "auth_providers", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "provider"
    t.string "uid"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_auth_providers_on_user_id"
  end

  create_table "bids", force: :cascade do |t|
    t.bigint "auction_id", null: false
    t.bigint "coffee_shop_id", null: false
    t.bigint "user_id", null: false
    t.integer "amount", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["auction_id"], name: "index_bids_on_auction_id"
    t.index ["coffee_shop_id"], name: "index_bids_on_coffee_shop_id"
    t.index ["user_id"], name: "index_bids_on_user_id"
  end

  create_table "bookmark_collections", force: :cascade do |t|
    t.bigint "bookmark_id", null: false
    t.bigint "collection_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bookmark_id"], name: "index_bookmark_collections_on_bookmark_id"
    t.index ["collection_id"], name: "index_bookmark_collections_on_collection_id"
  end

  create_table "bookmarks", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "coffee_shop_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["coffee_shop_id"], name: "index_bookmarks_on_coffee_shop_id"
    t.index ["user_id"], name: "index_bookmarks_on_user_id"
  end

  create_table "check_ins", force: :cascade do |t|
    t.bigint "coffee_shop_id", null: false
    t.bigint "user_id", null: false
    t.decimal "lat"
    t.decimal "lng"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["coffee_shop_id"], name: "index_check_ins_on_coffee_shop_id"
    t.index ["user_id"], name: "index_check_ins_on_user_id"
  end

  create_table "coffee_shop_owners", force: :cascade do |t|
    t.bigint "coffee_shop_id", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["coffee_shop_id"], name: "index_coffee_shop_owners_on_coffee_shop_id"
    t.index ["user_id"], name: "index_coffee_shop_owners_on_user_id"
  end

  create_table "coffee_shop_tags", force: :cascade do |t|
    t.bigint "coffee_shop_id", null: false
    t.bigint "tag_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["coffee_shop_id"], name: "index_coffee_shop_tags_on_coffee_shop_id"
    t.index ["tag_id"], name: "index_coffee_shop_tags_on_tag_id"
  end

  create_table "coffee_shops", force: :cascade do |t|
    t.string "name"
    t.jsonb "urls", default: {}, null: false
    t.integer "status", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "slug", null: false
    t.bigint "submitter_user_id"
    t.text "admin_notes"
    t.datetime "approved_at"
    t.string "uuid"
    t.index ["slug"], name: "index_coffee_shops_on_slug", unique: true
    t.index ["status"], name: "index_coffee_shops_on_status"
    t.index ["submitter_user_id"], name: "index_coffee_shops_on_submitter_user_id"
    t.index ["uuid"], name: "index_coffee_shops_on_uuid", unique: true
  end

  create_table "collections", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "slug"
    t.index ["user_id"], name: "index_collections_on_user_id"
  end

  create_table "favourites", force: :cascade do |t|
    t.bigint "coffee_shop_id", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["coffee_shop_id"], name: "index_favourites_on_coffee_shop_id"
    t.index ["user_id"], name: "index_favourites_on_user_id"
  end

  create_table "feedbacks", force: :cascade do |t|
    t.bigint "user_id"
    t.bigint "coffee_shop_id", null: false
    t.string "contact"
    t.text "message", null: false
    t.datetime "opened_at", precision: nil
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["coffee_shop_id"], name: "index_feedbacks_on_coffee_shop_id"
    t.index ["user_id"], name: "index_feedbacks_on_user_id"
  end

  create_table "google_locations", force: :cascade do |t|
    t.bigint "coffee_shop_id", null: false
    t.string "place_id"
    t.float "lat"
    t.float "lng"
    t.string "locality"
    t.string "administrative_area_level_1"
    t.string "administrative_area_level_2"
    t.string "postal_code"
    t.string "country"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["coffee_shop_id"], name: "index_google_locations_on_coffee_shop_id"
  end

  create_table "locations", force: :cascade do |t|
    t.string "country"
    t.string "state"
    t.string "city"
    t.string "postcode"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "opening_hours", force: :cascade do |t|
    t.bigint "coffee_shop_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "start_day"
    t.integer "start_time"
    t.integer "close_day"
    t.integer "close_time"
    t.index ["coffee_shop_id"], name: "index_opening_hours_on_coffee_shop_id"
  end

  create_table "sync_logs", force: :cascade do |t|
    t.string "syncable_type", null: false
    t.bigint "syncable_id", null: false
    t.string "message"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["syncable_type", "syncable_id"], name: "index_sync_logs_on_syncable"
  end

  create_table "tags", force: :cascade do |t|
    t.string "name", null: false
    t.string "slug", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "description"
    t.string "group"
    t.integer "position"
    t.boolean "is_public", default: true
    t.index ["name"], name: "index_tags_on_name", unique: true
    t.index ["slug"], name: "index_tags_on_slug", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "role"
    t.string "username"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  create_table "versions", force: :cascade do |t|
    t.string "item_type"
    t.bigint "item_id", null: false
    t.string "event", null: false
    t.string "whodunnit"
    t.json "object"
    t.json "object_changes"
    t.datetime "created_at"
    t.index ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "auth_providers", "users"
  add_foreign_key "bids", "auctions"
  add_foreign_key "bids", "coffee_shops"
  add_foreign_key "bids", "users"
  add_foreign_key "bookmark_collections", "bookmarks"
  add_foreign_key "bookmark_collections", "collections"
  add_foreign_key "bookmarks", "coffee_shops"
  add_foreign_key "bookmarks", "users"
  add_foreign_key "check_ins", "coffee_shops"
  add_foreign_key "check_ins", "users"
  add_foreign_key "coffee_shop_owners", "coffee_shops"
  add_foreign_key "coffee_shop_owners", "users"
  add_foreign_key "coffee_shop_tags", "coffee_shops"
  add_foreign_key "coffee_shop_tags", "tags"
  add_foreign_key "coffee_shops", "users", column: "submitter_user_id"
  add_foreign_key "collections", "users"
  add_foreign_key "favourites", "coffee_shops"
  add_foreign_key "favourites", "users"
  add_foreign_key "feedbacks", "coffee_shops"
  add_foreign_key "feedbacks", "users"
  add_foreign_key "google_locations", "coffee_shops"
  add_foreign_key "opening_hours", "coffee_shops"
end
