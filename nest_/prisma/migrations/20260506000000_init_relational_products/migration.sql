-- CreateTable
CREATE TABLE "cache" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiration" INTEGER NOT NULL,

    CONSTRAINT "cache_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "cache_locks" (
    "key" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "expiration" INTEGER NOT NULL,

    CONSTRAINT "cache_locks_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" SERIAL NOT NULL,
    "queue" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL,
    "reserved_at" INTEGER,
    "available_at" INTEGER NOT NULL,
    "created_at" INTEGER NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_batches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "total_jobs" INTEGER NOT NULL,
    "pending_jobs" INTEGER NOT NULL,
    "failed_jobs" INTEGER NOT NULL,
    "failed_job_ids" TEXT NOT NULL,
    "options" TEXT,
    "cancelled_at" INTEGER,
    "created_at" INTEGER NOT NULL,
    "finished_at" INTEGER,

    CONSTRAINT "job_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "failed_jobs" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "connection" TEXT NOT NULL,
    "queue" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "exception" TEXT NOT NULL,
    "failed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "failed_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "migrations" (
    "id" SERIAL NOT NULL,
    "migration" TEXT NOT NULL,
    "batch" INTEGER NOT NULL,

    CONSTRAINT "migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "payload" TEXT NOT NULL,
    "last_activity" INTEGER NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitors" (
    "id" SERIAL NOT NULL,
    "ip_address" TEXT NOT NULL,
    "visit_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified_at" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "remember_token" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "status" INTEGER NOT NULL DEFAULT 1,
    "password_changed_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "last_login_ip" TEXT,
    "remember_token" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "mobile" TEXT,
    "password" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "is_block" BOOLEAN NOT NULL DEFAULT false,
    "blocked_at" TIMESTAMP(3),
    "block_reason" TEXT,
    "email_verified_at" TIMESTAMP(3),
    "mobile_verified_at" TIMESTAMP(3),
    "password_changed_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "last_login_ip" TEXT,
    "remember_token" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "blocked_by" INTEGER,
    "dob" TIMESTAMP(3),
    "address" TEXT,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_access_tokens" (
    "id" SERIAL NOT NULL,
    "tokenable_type" TEXT NOT NULL,
    "tokenable_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "abilities" TEXT,
    "last_used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "personal_access_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_histories" (
    "id" SERIAL NOT NULL,
    "user_type" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER,
    "customer_id" INTEGER,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" INTEGER,
    "old_data" TEXT,
    "new_data" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "additional_data" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_trails" (
    "id" SERIAL NOT NULL,
    "auditable_type" TEXT NOT NULL,
    "auditable_id" INTEGER NOT NULL,
    "admin_id" INTEGER,
    "customer_id" INTEGER,
    "event" TEXT NOT NULL,
    "old_values" TEXT,
    "new_values" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "url" TEXT,
    "tags" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "audit_trails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" SERIAL NOT NULL,
    "message_id" TEXT,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "metadata" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered_at" TIMESTAMP(3),
    "opened_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_logs" (
    "id" SERIAL NOT NULL,
    "message_id" TEXT,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "metadata" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "sms_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "group" TEXT NOT NULL DEFAULT 'general',
    "key" TEXT NOT NULL,
    "value" TEXT,
    "type" TEXT NOT NULL DEFAULT 'text',
    "options" TEXT,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "is_encrypted" BOOLEAN NOT NULL DEFAULT false,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "url_redirects" (
    "id" SERIAL NOT NULL,
    "source_url" TEXT NOT NULL,
    "target_url" TEXT NOT NULL,
    "redirect_type" TEXT NOT NULL DEFAULT 'TYPE_301',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "hit_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "url_redirects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currencies" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "exchange_rate" DOUBLE PRECISION NOT NULL DEFAULT 1.00000000,
    "Float_places" INTEGER NOT NULL DEFAULT 2,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "disk" TEXT NOT NULL DEFAULT 'public',
    "file_path" TEXT,
    "file_name" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_type" TEXT,
    "extension" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "thumbnails" TEXT,
    "alt_text" TEXT,
    "title" TEXT,
    "description" TEXT,
    "uploaded_by" INTEGER,
    "uploader_type" TEXT,
    "metadata" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_metadata" (
    "id" SERIAL NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT,
    "og_title" TEXT,
    "og_description" TEXT,
    "og_image" TEXT,
    "og_type" TEXT,
    "twitter_card" TEXT,
    "twitter_title" TEXT,
    "twitter_description" TEXT,
    "twitter_image" TEXT,
    "canonical_url" TEXT,
    "robots" TEXT,
    "is_noindex" BOOLEAN NOT NULL DEFAULT false,
    "is_nofollow" BOOLEAN NOT NULL DEFAULT false,
    "structured_data" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "seo_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attributes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "is_variant" BOOLEAN NOT NULL DEFAULT false,
    "is_filterable" BOOLEAN NOT NULL DEFAULT true,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribute_values" (
    "id" SERIAL NOT NULL,
    "attribute_id" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "code" TEXT,
    "color_code" TEXT,
    "image_id" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "attribute_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "color" TEXT DEFAULT '#3b82f6',
    "icon" TEXT DEFAULT 'fas fa-tag',
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specifications" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_filterable" BOOLEAN NOT NULL DEFAULT true,
    "is_required" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "specifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specification_groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "specification_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spec_group_specs" (
    "specification_group_id" INTEGER NOT NULL,
    "specification_id" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "spec_group_specs_pkey" PRIMARY KEY ("specification_group_id","specification_id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo_id" INTEGER,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "featured" INTEGER NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "meta_keywords" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image_url" TEXT,
    "image_id" INTEGER,
    "description" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "featured" INTEGER NOT NULL DEFAULT 0,
    "show_in_nav" INTEGER NOT NULL DEFAULT 1,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "meta_keywords" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_attributes" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "attribute_id" INTEGER NOT NULL,
    "is_required" INTEGER NOT NULL DEFAULT 0,
    "is_filterable" INTEGER NOT NULL DEFAULT 1,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "category_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_hierarchies" (
    "id" SERIAL NOT NULL,
    "ancestor_id" INTEGER NOT NULL,
    "descendant_id" INTEGER NOT NULL,
    "depth" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "category_hierarchies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_spec_groups" (
    "category_id" INTEGER NOT NULL,
    "specification_group_id" INTEGER NOT NULL,

    CONSTRAINT "category_spec_groups_pkey" PRIMARY KEY ("category_id","specification_group_id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "brand_id" INTEGER,
    "tax_class_id" INTEGER,
    "main_category_id" INTEGER,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "product_code" TEXT,
    "product_type" TEXT NOT NULL DEFAULT 'simple',
    "subtitle" TEXT,
    "tagline" TEXT,
    "hero_image" TEXT,
    "heritage_text" TEXT,
    "bg_color" TEXT,
    "accent_color" TEXT,
    "text_color" TEXT,
    "gradient" TEXT,
    "mist_color" TEXT,
    "description" TEXT,
    "short_description" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "special_price" DOUBLE PRECISION,
    "special_price_start" TIMESTAMP(3),
    "special_price_end" TIMESTAMP(3),
    "selling_price" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "manage_stock" BOOLEAN NOT NULL DEFAULT true,
    "qty" INTEGER NOT NULL DEFAULT 0,
    "in_stock" BOOLEAN NOT NULL DEFAULT true,
    "cod_available" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'active',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_new" BOOLEAN NOT NULL DEFAULT false,
    "is_bestseller" BOOLEAN NOT NULL DEFAULT false,
    "weight" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "viewed" INTEGER NOT NULL DEFAULT 0,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "meta_keywords" TEXT,
    "images" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "video_url" TEXT,
    "theme" TEXT,
    "discover_hero_bg_image" TEXT,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "sku" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "compare_price" DOUBLE PRECISION,
    "cost_price" DOUBLE PRECISION,
    "special_price" DOUBLE PRECISION,
    "special_price_start" TIMESTAMP(3),
    "special_price_end" TIMESTAMP(3),
    "selling_price" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "manage_stock" BOOLEAN NOT NULL DEFAULT true,
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved_quantity" INTEGER NOT NULL DEFAULT 0,
    "in_stock" BOOLEAN NOT NULL DEFAULT true,
    "stock_status" TEXT NOT NULL DEFAULT 'instock',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "combination_hash" TEXT,
    "weight" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_product" (
    "product_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "category_product_pkey" PRIMARY KEY ("product_id","category_id")
);

-- CreateTable
CREATE TABLE "product_tags" (
    "product_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "product_tags_pkey" PRIMARY KEY ("product_id","tag_id")
);

-- CreateTable
CREATE TABLE "product_specifications" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "specification_id" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "specification_value_id" INTEGER,

    CONSTRAINT "product_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variant_attributes" (
    "id" SERIAL NOT NULL,
    "variant_id" INTEGER NOT NULL,
    "attribute_id" INTEGER NOT NULL,
    "attribute_value_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "variant_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variant_images" (
    "id" SERIAL NOT NULL,
    "variant_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,
    "is_primary" INTEGER NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "type" TEXT NOT NULL DEFAULT 'GALLERY',

    CONSTRAINT "variant_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_media" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GALLERY',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "product_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "related_products" (
    "product_id" INTEGER NOT NULL,
    "related_product_id" INTEGER NOT NULL,

    CONSTRAINT "related_products_pkey" PRIMARY KEY ("product_id","related_product_id")
);

-- CreateTable
CREATE TABLE "cross_sell_products" (
    "product_id" INTEGER NOT NULL,
    "cross_sell_product_id" INTEGER NOT NULL,

    CONSTRAINT "cross_sell_products_pkey" PRIMARY KEY ("product_id","cross_sell_product_id")
);

-- CreateTable
CREATE TABLE "upsell_products" (
    "product_id" INTEGER NOT NULL,
    "up_sell_product_id" INTEGER NOT NULL,

    CONSTRAINT "upsell_products_pkey" PRIMARY KEY ("product_id","up_sell_product_id")
);

-- CreateTable
CREATE TABLE "tier_prices" (
    "id" SERIAL NOT NULL,
    "product_variant_id" INTEGER NOT NULL,
    "min_quantity" INTEGER NOT NULL,
    "max_quantity" INTEGER,
    "price" DOUBLE PRECISION NOT NULL,
    "customer_group" TEXT NOT NULL DEFAULT 'all',
    "customer_segment_id" INTEGER,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tier_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_classes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "is_default" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tax_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "country_code" TEXT,
    "state_code" TEXT,
    "zip_code" TEXT,
    "rate" DOUBLE PRECISION NOT NULL,
    "is_active" INTEGER NOT NULL DEFAULT 1,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "code" TEXT,
    "description" TEXT,
    "is_compound" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'percentage',

    CONSTRAINT "tax_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_zones" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "countries" TEXT,
    "states" TEXT,
    "zip_codes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "shipping_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_methods" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "config" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "shipping_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "pincode" TEXT,
    "contact_person" TEXT,
    "contact_number" TEXT,
    "is_default" INTEGER NOT NULL DEFAULT 0,
    "is_active" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transfers" (
    "id" SERIAL NOT NULL,
    "transfer_number" TEXT NOT NULL,
    "from_warehouse_id" INTEGER NOT NULL,
    "to_warehouse_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_by" INTEGER,
    "approved_by" INTEGER,
    "approved_at" TIMESTAMP(3),
    "shipped_at" TIMESTAMP(3),
    "received_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "inventory_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transfer_items" (
    "id" SERIAL NOT NULL,
    "inventory_transfer_id" INTEGER NOT NULL,
    "product_variant_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "received_quantity" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "productId" INTEGER,

    CONSTRAINT "inventory_transfer_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_history" (
    "id" SERIAL NOT NULL,
    "product_variant_id" INTEGER NOT NULL,
    "change_type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "old_quantity" INTEGER,
    "new_quantity" INTEGER,
    "reason" TEXT,
    "source_type" TEXT,
    "source_id" INTEGER,
    "admin_id" INTEGER,
    "customer_id" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "productId" INTEGER,

    CONSTRAINT "stock_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carts" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER,
    "session_id" TEXT,
    "currency_id" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "tax_total" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "shipping_total" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "discount_total" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "grand_total" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "offer_id" INTEGER,
    "shipping_address_id" INTEGER,
    "billing_address_id" INTEGER,
    "abandoned_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" SERIAL NOT NULL,
    "cart_id" INTEGER NOT NULL,
    "product_variant_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "discount_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "offer_id" INTEGER,
    "attributes" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "productId" INTEGER,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_collections" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "item_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_collection_items" (
    "id" SERIAL NOT NULL,
    "item_collection_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "product_variant_id" INTEGER,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "item_collection_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "states" (
    "id" SERIAL NOT NULL,
    "country_id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlists" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER,
    "name" TEXT NOT NULL DEFAULT 'Default',
    "is_public" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "session_id" TEXT,

    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_segments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "customer_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "popups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "image" TEXT,
    "link" TEXT,
    "type" TEXT NOT NULL DEFAULT 'classic',
    "trigger" TEXT NOT NULL DEFAULT 'on_load',
    "delay_seconds" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_rules" TEXT,
    "targeting_rules" TEXT,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "popups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banners" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "content" TEXT,
    "image" TEXT,
    "link" TEXT,
    "cta_text" TEXT,
    "cta_link" TEXT,
    "text_color" TEXT,
    "type" TEXT NOT NULL DEFAULT 'image',
    "position" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_programs" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "points_per_currency" DOUBLE PRECISION NOT NULL DEFAULT 1.00,
    "signup_bonus" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "first_purchase_bonus" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "min_redeemable_points" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "point_value" DOUBLE PRECISION NOT NULL DEFAULT 1.00,
    "status" INTEGER NOT NULL DEFAULT 1,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "loyalty_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rewards" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "points_required" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_rewards" (
    "id" SERIAL NOT NULL,
    "promotion_id" INTEGER NOT NULL,
    "reward_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "promotion_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_usages" (
    "id" SERIAL NOT NULL,
    "reward_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "reward_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "user_name" TEXT NOT NULL,
    "user_icon" TEXT,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_votes" (
    "id" SERIAL NOT NULL,
    "product_review_id" INTEGER NOT NULL,
    "customer_id" INTEGER,
    "session_id" TEXT,
    "vote" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "review_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_images" (
    "id" SERIAL NOT NULL,
    "product_review_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "review_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT,
    "message" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "image" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_images" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "image" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "community_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "template_id" INTEGER,
    "notifiable_type" TEXT NOT NULL,
    "notifiable_id" INTEGER NOT NULL,
    "subject" TEXT,
    "content" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "data" TEXT,
    "sent_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_sequences" (
    "id" SERIAL NOT NULL,
    "prefix" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "last_number" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "order_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER,
    "order_number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "shipping_status" TEXT NOT NULL DEFAULT 'pending',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "tax_total" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "shipping_total" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "discount_total" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "grand_total" DOUBLE PRECISION NOT NULL,
    "customer_first_name" TEXT NOT NULL,
    "customer_last_name" TEXT NOT NULL,
    "customer_mobile" TEXT,
    "shipping_method_id" INTEGER,
    "payment_method" TEXT,
    "offer_id" INTEGER,
    "loyalty_points_used" DOUBLE PRECISION,
    "loyalty_points_earned" DOUBLE PRECISION,
    "coupon_code" TEXT,
    "customer_note" TEXT,
    "admin_note" TEXT,
    "cancellation_reason" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "processing_at" TIMESTAMP(3),
    "shipped_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "customer_dob" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "product_id" INTEGER,
    "product_variant_id" INTEGER NOT NULL,
    "product_name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "compare_price" DOUBLE PRECISION,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "discount_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "total" DOUBLE PRECISION NOT NULL,
    "attributes" TEXT,
    "offer_id" INTEGER,
    "loyalty_points" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_cards" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "initial_value" DOUBLE PRECISION NOT NULL,
    "current_value" DOUBLE PRECISION NOT NULL,
    "currency_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'active',
    "purchased_by" INTEGER,
    "recipient_id" INTEGER,
    "recipient_email" TEXT,
    "recipient_name" TEXT,
    "message" TEXT,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "gift_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_addresses" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address1" TEXT NOT NULL,
    "address2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "order_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "tracking_number" TEXT,
    "carrier" TEXT,
    "carrier_service" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "weight" DOUBLE PRECISION,
    "dimensions" TEXT,
    "shipping_label" TEXT,
    "shipped_at" TIMESTAMP(3),
    "estimated_delivery" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "delivery_notes" TEXT,
    "delivered_to" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipment_items" (
    "id" SERIAL NOT NULL,
    "shipment_id" INTEGER NOT NULL,
    "order_item_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "shipment_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "returns" (
    "id" SERIAL NOT NULL,
    "return_number" TEXT NOT NULL,
    "order_id" INTEGER NOT NULL,
    "customer_id" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "type" TEXT,
    "reason" TEXT,
    "notes" TEXT,
    "refund_amount" DOUBLE PRECISION,
    "refund_payment_id" INTEGER,
    "requested_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "received_at" TIMESTAMP(3),
    "processed_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_items" (
    "id" SERIAL NOT NULL,
    "return_id" INTEGER NOT NULL,
    "order_item_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "condition" TEXT,
    "reason" TEXT,
    "refund_amount" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "return_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_sections" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "home_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_page_sections" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "type" TEXT NOT NULL DEFAULT 'banner',
    "data" TEXT,
    "display_rules" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "home_page_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_history" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "admin_id" INTEGER,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_stocks" (
    "id" SERIAL NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "product_variant_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved_quantity" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "warehouse_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist_items" (
    "id" SERIAL NOT NULL,
    "wishlist_id" INTEGER NOT NULL,
    "product_variant_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "trigger_event" TEXT,
    "variables" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "color" TEXT DEFAULT '#3b82f6',
    "icon" TEXT DEFAULT 'fas fa-tag',
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "currency_id" INTEGER,
    "payment_method" TEXT,
    "payment_gateway" TEXT,
    "transaction_id" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "failure_reason" TEXT,
    "response" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_loyalty" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "loyalty_program_id" INTEGER NOT NULL,
    "total_points" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "available_points" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "used_points" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "expired_points" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "tier_level" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "customer_loyalty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_transactions" (
    "id" SERIAL NOT NULL,
    "customer_loyalty_id" INTEGER NOT NULL,
    "customer_id" INTEGER,
    "type" TEXT NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "reference_type" TEXT,
    "reference_id" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_addresses" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'shipping',
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_card_transactions" (
    "id" SERIAL NOT NULL,
    "gift_card_id" INTEGER NOT NULL,
    "customer_id" INTEGER,
    "amount" DOUBLE PRECISION NOT NULL,
    "balance_before" DOUBLE PRECISION NOT NULL,
    "balance_after" DOUBLE PRECISION NOT NULL,
    "reference_type" TEXT,
    "reference_id" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "gift_card_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_segment_members" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "customer_segment_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_segment_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "offer_type" TEXT NOT NULL,
    "coupon_type" TEXT NOT NULL DEFAULT 'public',
    "discount_value" DOUBLE PRECISION,
    "buy_qty" INTEGER,
    "get_qty" INTEGER,
    "min_cart_amount" DOUBLE PRECISION,
    "max_cart_amount" DOUBLE PRECISION,
    "max_discount" DOUBLE PRECISION,
    "max_uses" INTEGER,
    "uses_per_customer" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "banner" TEXT,
    "banner_button_text" TEXT,
    "banner_button_link" TEXT,
    "show_at_start" BOOLEAN NOT NULL DEFAULT false,
    "is_auto_apply" BOOLEAN NOT NULL DEFAULT true,
    "is_stackable" BOOLEAN NOT NULL DEFAULT false,
    "is_exclusive" BOOLEAN NOT NULL DEFAULT false,
    "customer_segment_id" INTEGER,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_categories" (
    "id" SERIAL NOT NULL,
    "offer_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "offer_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_rewards" (
    "id" SERIAL NOT NULL,
    "offer_id" INTEGER NOT NULL,
    "reward_product_id" INTEGER NOT NULL,
    "reward_variant_id" INTEGER,
    "reward_qty" INTEGER NOT NULL DEFAULT 1,
    "same_as_buy_product" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "offer_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_usages" (
    "id" SERIAL NOT NULL,
    "offer_id" INTEGER NOT NULL,
    "customer_id" INTEGER,
    "order_id" INTEGER,
    "discount_amount" DOUBLE PRECISION,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "offer_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_variants" (
    "id" SERIAL NOT NULL,
    "offer_id" INTEGER NOT NULL,
    "product_variant_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "offer_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_attempts" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "currency_id" INTEGER,
    "payment_method" TEXT NOT NULL,
    "attempt_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'initiated',
    "gateway_response" TEXT,
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "payment_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "popup_stats" (
    "id" SERIAL NOT NULL,
    "popup_id" INTEGER NOT NULL,
    "session_id" TEXT,
    "customer_id" INTEGER,
    "action" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "page_data" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "popup_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_histories" (
    "id" SERIAL NOT NULL,
    "product_variant_id" INTEGER NOT NULL,
    "old_price" DOUBLE PRECISION NOT NULL,
    "new_price" DOUBLE PRECISION NOT NULL,
    "old_compare_price" DOUBLE PRECISION,
    "new_compare_price" DOUBLE PRECISION,
    "changed_by" INTEGER,
    "change_reason" TEXT,
    "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "price_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specification_values" (
    "id" SERIAL NOT NULL,
    "specification_id" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "specification_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_charges" (
    "id" SERIAL NOT NULL,
    "shipping_zone_id" INTEGER NOT NULL,
    "shipping_method_id" INTEGER NOT NULL,
    "min_weight" DOUBLE PRECISION,
    "max_weight" DOUBLE PRECISION,
    "min_price" DOUBLE PRECISION,
    "max_price" DOUBLE PRECISION,
    "charge" DOUBLE PRECISION NOT NULL,
    "free_shipping_threshold" DOUBLE PRECISION,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "shipping_charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_reviews" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "product_variant_id" INTEGER,
    "customer_id" INTEGER,
    "admin_id" INTEGER,
    "order_item_id" INTEGER,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_admin_review" BOOLEAN NOT NULL DEFAULT false,
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "not_helpful_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TaxClassToTaxRate" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "jobs_queue_index" ON "jobs"("queue");

-- CreateIndex
CREATE UNIQUE INDEX "failed_jobs_uuid_unique" ON "failed_jobs"("uuid");

-- CreateIndex
CREATE INDEX "sessions_user_id_index" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_last_activity_index" ON "sessions"("last_activity");

-- CreateIndex
CREATE UNIQUE INDEX "visitors_ip_address_visit_date_unique" ON "visitors"("ip_address", "visit_date");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_unique" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_unique" ON "admins"("email");

-- CreateIndex
CREATE INDEX "admins_status_index" ON "admins"("status");

-- CreateIndex
CREATE INDEX "admins_role_index" ON "admins"("role");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_unique" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_mobile_unique" ON "customers"("mobile");

-- CreateIndex
CREATE INDEX "customers_status_index" ON "customers"("status");

-- CreateIndex
CREATE INDEX "customers_email_verified_at_index" ON "customers"("email_verified_at");

-- CreateIndex
CREATE INDEX "customers_mobile_verified_at_index" ON "customers"("mobile_verified_at");

-- CreateIndex
CREATE INDEX "customers_blocked_by_foreign" ON "customers"("blocked_by");

-- CreateIndex
CREATE UNIQUE INDEX "personal_access_tokens_token_unique" ON "personal_access_tokens"("token");

-- CreateIndex
CREATE INDEX "personal_access_tokens_tokenable_type_tokenable_id_index" ON "personal_access_tokens"("tokenable_type", "tokenable_id");

-- CreateIndex
CREATE INDEX "personal_access_tokens_expires_at_index" ON "personal_access_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "password_histories_user_type_user_id_index" ON "password_histories"("user_type", "user_id");

-- CreateIndex
CREATE INDEX "password_histories_user_type_user_id_created_at_index" ON "password_histories"("user_type", "user_id", "created_at");

-- CreateIndex
CREATE INDEX "activity_logs_entity_type_entity_id_index" ON "activity_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "activity_logs_created_at_index" ON "activity_logs"("created_at");

-- CreateIndex
CREATE INDEX "activity_logs_admin_id_index" ON "activity_logs"("admin_id");

-- CreateIndex
CREATE INDEX "activity_logs_customer_id_index" ON "activity_logs"("customer_id");

-- CreateIndex
CREATE INDEX "activity_logs_action_index" ON "activity_logs"("action");

-- CreateIndex
CREATE INDEX "audit_trails_auditable_type_auditable_id_index" ON "audit_trails"("auditable_type", "auditable_id");

-- CreateIndex
CREATE INDEX "audit_trails_event_index" ON "audit_trails"("event");

-- CreateIndex
CREATE INDEX "audit_trails_created_at_index" ON "audit_trails"("created_at");

-- CreateIndex
CREATE INDEX "audit_trails_admin_id_index" ON "audit_trails"("admin_id");

-- CreateIndex
CREATE INDEX "audit_trails_customer_id_index" ON "audit_trails"("customer_id");

-- CreateIndex
CREATE INDEX "email_logs_to_index" ON "email_logs"("to");

-- CreateIndex
CREATE INDEX "email_logs_status_index" ON "email_logs"("status");

-- CreateIndex
CREATE INDEX "email_logs_sent_at_index" ON "email_logs"("sent_at");

-- CreateIndex
CREATE INDEX "sms_logs_to_index" ON "sms_logs"("to");

-- CreateIndex
CREATE INDEX "sms_logs_status_index" ON "sms_logs"("status");

-- CreateIndex
CREATE INDEX "sms_logs_sent_at_index" ON "sms_logs"("sent_at");

-- CreateIndex
CREATE INDEX "settings_group_index" ON "settings"("group");

-- CreateIndex
CREATE INDEX "settings_sort_order_index" ON "settings"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "settings_group_key_unique" ON "settings"("group", "key");

-- CreateIndex
CREATE UNIQUE INDEX "url_redirects_source_url_unique" ON "url_redirects"("source_url");

-- CreateIndex
CREATE INDEX "url_redirects_source_url_index" ON "url_redirects"("source_url");

-- CreateIndex
CREATE INDEX "url_redirects_is_active_index" ON "url_redirects"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_code_unique" ON "currencies"("code");

-- CreateIndex
CREATE INDEX "currencies_is_active_index" ON "currencies"("is_active");

-- CreateIndex
CREATE INDEX "media_disk_index" ON "media"("disk");

-- CreateIndex
CREATE INDEX "media_mime_type_index" ON "media"("mime_type");

-- CreateIndex
CREATE INDEX "media_file_type_index" ON "media"("file_type");

-- CreateIndex
CREATE INDEX "media_uploaded_by_index" ON "media"("uploaded_by");

-- CreateIndex
CREATE INDEX "seo_metadata_entity_type_entity_id_index" ON "seo_metadata"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "attributes_code_unique" ON "attributes"("code");

-- CreateIndex
CREATE INDEX "attributes_is_filterable_index" ON "attributes"("is_filterable");

-- CreateIndex
CREATE INDEX "attribute_values_attribute_id_index" ON "attribute_values"("attribute_id");

-- CreateIndex
CREATE INDEX "attribute_values_image_id_foreign" ON "attribute_values"("image_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_unique" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "tags_is_active_index" ON "tags"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "specifications_code_unique" ON "specifications"("code");

-- CreateIndex
CREATE INDEX "spec_group_specs_specification_id_foreign" ON "spec_group_specs"("specification_id");

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_unique" ON "brands"("slug");

-- CreateIndex
CREATE INDEX "brands_status_index" ON "brands"("is_active");

-- CreateIndex
CREATE INDEX "brands_featured_index" ON "brands"("featured");

-- CreateIndex
CREATE INDEX "brands_slug_index" ON "brands"("slug");

-- CreateIndex
CREATE INDEX "brands_logo_id_foreign" ON "brands"("logo_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_unique" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_status_index" ON "categories"("status");

-- CreateIndex
CREATE INDEX "categories_parent_id_index" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "categories_featured_index" ON "categories"("featured");

-- CreateIndex
CREATE INDEX "categories_show_in_nav_index" ON "categories"("show_in_nav");

-- CreateIndex
CREATE INDEX "categories_slug_index" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_image_id_foreign" ON "categories"("image_id");

-- CreateIndex
CREATE INDEX "category_attributes_attribute_id_foreign" ON "category_attributes"("attribute_id");

-- CreateIndex
CREATE UNIQUE INDEX "category_attributes_category_id_attribute_id_unique" ON "category_attributes"("category_id", "attribute_id");

-- CreateIndex
CREATE INDEX "category_hierarchies_descendant_id_index" ON "category_hierarchies"("descendant_id");

-- CreateIndex
CREATE UNIQUE INDEX "category_hierarchies_ancestor_id_descendant_id_unique" ON "category_hierarchies"("ancestor_id", "descendant_id");

-- CreateIndex
CREATE INDEX "category_spec_groups_specification_group_id_foreign" ON "category_spec_groups"("specification_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_unique" ON "products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_unique" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_status_index" ON "products"("status");

-- CreateIndex
CREATE INDEX "products_brand_id_foreign" ON "products"("brand_id");

-- CreateIndex
CREATE INDEX "products_tax_class_id_foreign" ON "products"("tax_class_id");

-- CreateIndex
CREATE INDEX "products_main_category_id_foreign" ON "products"("main_category_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_unique" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_product_id_foreign" ON "product_variants"("product_id");

-- CreateIndex
CREATE INDEX "product_variants_is_active_index" ON "product_variants"("is_active");

-- CreateIndex
CREATE INDEX "category_product_category_id_foreign" ON "category_product"("category_id");

-- CreateIndex
CREATE INDEX "product_tags_tag_id_foreign" ON "product_tags"("tag_id");

-- CreateIndex
CREATE INDEX "product_specifications_product_id_foreign" ON "product_specifications"("product_id");

-- CreateIndex
CREATE INDEX "product_specifications_specification_id_foreign" ON "product_specifications"("specification_id");

-- CreateIndex
CREATE INDEX "variant_attributes_variant_id_index" ON "variant_attributes"("variant_id");

-- CreateIndex
CREATE INDEX "variant_attributes_attribute_value_id_index" ON "variant_attributes"("attribute_value_id");

-- CreateIndex
CREATE UNIQUE INDEX "variant_attributes_variant_id_attribute_id_unique" ON "variant_attributes"("variant_id", "attribute_id");

-- CreateIndex
CREATE INDEX "variant_images_variant_id_index" ON "variant_images"("variant_id");

-- CreateIndex
CREATE INDEX "variant_images_media_id_foreign" ON "variant_images"("media_id");

-- CreateIndex
CREATE UNIQUE INDEX "variant_images_variant_id_media_id_unique" ON "variant_images"("variant_id", "media_id");

-- CreateIndex
CREATE INDEX "product_media_product_id_index" ON "product_media"("product_id");

-- CreateIndex
CREATE INDEX "product_media_media_id_foreign" ON "product_media"("media_id");

-- CreateIndex
CREATE INDEX "related_products_related_product_id_foreign" ON "related_products"("related_product_id");

-- CreateIndex
CREATE INDEX "cross_sell_products_cross_sell_product_id_foreign" ON "cross_sell_products"("cross_sell_product_id");

-- CreateIndex
CREATE INDEX "upsell_products_up_sell_product_id_foreign" ON "upsell_products"("up_sell_product_id");

-- CreateIndex
CREATE INDEX "tier_prices_product_variant_id_index" ON "tier_prices"("product_variant_id");

-- CreateIndex
CREATE INDEX "tier_prices_customer_segment_id_foreign" ON "tier_prices"("customer_segment_id");

-- CreateIndex
CREATE UNIQUE INDEX "tier_prices_unique" ON "tier_prices"("product_variant_id", "min_quantity", "customer_group", "customer_segment_id");

-- CreateIndex
CREATE UNIQUE INDEX "tax_classes_code_unique" ON "tax_classes"("code");

-- CreateIndex
CREATE INDEX "tax_classes_is_default_index" ON "tax_classes"("is_default");

-- CreateIndex
CREATE INDEX "tax_rates_is_active_index" ON "tax_rates"("is_active");

-- CreateIndex
CREATE INDEX "tax_rates_country_code_state_code_index" ON "tax_rates"("country_code", "state_code");

-- CreateIndex
CREATE INDEX "shipping_zones_name_index" ON "shipping_zones"("name");

-- CreateIndex
CREATE INDEX "shipping_zones_is_active_index" ON "shipping_zones"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_methods_code_unique" ON "shipping_methods"("code");

-- CreateIndex
CREATE INDEX "shipping_methods_is_active_index" ON "shipping_methods"("is_active");

-- CreateIndex
CREATE INDEX "shipping_methods_sort_order_index" ON "shipping_methods"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_unique" ON "warehouses"("code");

-- CreateIndex
CREATE INDEX "warehouses_is_default_index" ON "warehouses"("is_default");

-- CreateIndex
CREATE INDEX "warehouses_is_active_index" ON "warehouses"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_transfers_transfer_number_unique" ON "inventory_transfers"("transfer_number");

-- CreateIndex
CREATE INDEX "inventory_transfers_transfer_number_index" ON "inventory_transfers"("transfer_number");

-- CreateIndex
CREATE INDEX "inventory_transfers_status_index" ON "inventory_transfers"("status");

-- CreateIndex
CREATE INDEX "inventory_transfers_from_warehouse_id_to_warehouse_id_index" ON "inventory_transfers"("from_warehouse_id", "to_warehouse_id");

-- CreateIndex
CREATE INDEX "inventory_transfers_to_warehouse_id_foreign" ON "inventory_transfers"("to_warehouse_id");

-- CreateIndex
CREATE INDEX "inventory_transfers_created_by_foreign" ON "inventory_transfers"("created_by");

-- CreateIndex
CREATE INDEX "inventory_transfers_approved_by_foreign" ON "inventory_transfers"("approved_by");

-- CreateIndex
CREATE INDEX "inventory_transfer_items_inventory_transfer_id_foreign" ON "inventory_transfer_items"("inventory_transfer_id");

-- CreateIndex
CREATE INDEX "inventory_transfer_items_product_variant_id_index" ON "inventory_transfer_items"("product_variant_id");

-- CreateIndex
CREATE INDEX "stock_history_product_variant_id_index" ON "stock_history"("product_variant_id");

-- CreateIndex
CREATE INDEX "stock_history_source_type_source_id_index" ON "stock_history"("source_type", "source_id");

-- CreateIndex
CREATE INDEX "stock_history_created_at_index" ON "stock_history"("created_at");

-- CreateIndex
CREATE INDEX "stock_history_change_type_index" ON "stock_history"("change_type");

-- CreateIndex
CREATE INDEX "stock_history_admin_id_foreign" ON "stock_history"("admin_id");

-- CreateIndex
CREATE INDEX "stock_history_customer_id_foreign" ON "stock_history"("customer_id");

-- CreateIndex
CREATE INDEX "carts_status_index" ON "carts"("status");

-- CreateIndex
CREATE INDEX "carts_abandoned_at_index" ON "carts"("abandoned_at");

-- CreateIndex
CREATE INDEX "carts_customer_id_foreign" ON "carts"("customer_id");

-- CreateIndex
CREATE INDEX "carts_currency_id_foreign" ON "carts"("currency_id");

-- CreateIndex
CREATE INDEX "carts_offer_id_foreign" ON "carts"("offer_id");

-- CreateIndex
CREATE INDEX "carts_shipping_address_id_foreign" ON "carts"("shipping_address_id");

-- CreateIndex
CREATE INDEX "carts_billing_address_id_foreign" ON "carts"("billing_address_id");

-- CreateIndex
CREATE UNIQUE INDEX "carts_customer_id_session_id_unique" ON "carts"("customer_id", "session_id");

-- CreateIndex
CREATE INDEX "cart_items_cart_id_index" ON "cart_items"("cart_id");

-- CreateIndex
CREATE INDEX "cart_items_product_variant_id_foreign" ON "cart_items"("product_variant_id");

-- CreateIndex
CREATE INDEX "cart_items_offer_id_index" ON "cart_items"("offer_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_product_variant_id_unique" ON "cart_items"("cart_id", "product_variant_id");

-- CreateIndex
CREATE INDEX "item_collections_customer_id_foreign" ON "item_collections"("customer_id");

-- CreateIndex
CREATE INDEX "item_collection_items_item_collection_id_foreign" ON "item_collection_items"("item_collection_id");

-- CreateIndex
CREATE INDEX "item_collection_items_product_id_foreign" ON "item_collection_items"("product_id");

-- CreateIndex
CREATE INDEX "item_collection_items_product_variant_id_foreign" ON "item_collection_items"("product_variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "countries_code_unique" ON "countries"("code");

-- CreateIndex
CREATE INDEX "states_country_id_foreign" ON "states"("country_id");

-- CreateIndex
CREATE INDEX "wishlists_customer_id_index" ON "wishlists"("customer_id");

-- CreateIndex
CREATE INDEX "wishlists_session_id_index" ON "wishlists"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "wishlists_customer_id_name_unique" ON "wishlists"("customer_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "customer_segments_code_unique" ON "customer_segments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_unique" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE INDEX "banners_is_active_index" ON "banners"("is_active");

-- CreateIndex
CREATE INDEX "banners_type_index" ON "banners"("type");

-- CreateIndex
CREATE INDEX "banners_position_index" ON "banners"("position");

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_programs_slug_unique" ON "loyalty_programs"("slug");

-- CreateIndex
CREATE INDEX "loyalty_programs_status_index" ON "loyalty_programs"("status");

-- CreateIndex
CREATE INDEX "loyalty_programs_starts_at_ends_at_index" ON "loyalty_programs"("starts_at", "ends_at");

-- CreateIndex
CREATE INDEX "promotion_rewards_promotion_id_foreign" ON "promotion_rewards"("promotion_id");

-- CreateIndex
CREATE INDEX "promotion_rewards_reward_id_foreign" ON "promotion_rewards"("reward_id");

-- CreateIndex
CREATE INDEX "reward_usages_reward_id_foreign" ON "reward_usages"("reward_id");

-- CreateIndex
CREATE INDEX "reward_usages_customer_id_foreign" ON "reward_usages"("customer_id");

-- CreateIndex
CREATE INDEX "reviews_product_id_foreign" ON "reviews"("product_id");

-- CreateIndex
CREATE INDEX "review_votes_product_review_id_foreign" ON "review_votes"("product_review_id");

-- CreateIndex
CREATE INDEX "review_votes_customer_id_foreign" ON "review_votes"("customer_id");

-- CreateIndex
CREATE INDEX "review_images_product_review_id_foreign" ON "review_images"("product_review_id");

-- CreateIndex
CREATE INDEX "review_images_media_id_foreign" ON "review_images"("media_id");

-- CreateIndex
CREATE INDEX "testimonials_is_active_index" ON "testimonials"("is_active");

-- CreateIndex
CREATE INDEX "testimonials_rating_index" ON "testimonials"("rating");

-- CreateIndex
CREATE INDEX "community_images_is_active_index" ON "community_images"("is_active");

-- CreateIndex
CREATE INDEX "community_images_sort_order_index" ON "community_images"("sort_order");

-- CreateIndex
CREATE INDEX "notifications_notifiable_type_notifiable_id_index" ON "notifications"("notifiable_type", "notifiable_id");

-- CreateIndex
CREATE INDEX "notifications_type_index" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_status_index" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_created_at_index" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "notifications_template_id_foreign" ON "notifications"("template_id");

-- CreateIndex
CREATE INDEX "notification_logs_customer_id_foreign" ON "notification_logs"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_sequences_prefix_year_month_unique" ON "order_sequences"("prefix", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_unique" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "order_items_order_id_foreign" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_foreign" ON "order_items"("product_id");

-- CreateIndex
CREATE INDEX "order_items_product_variant_id_foreign" ON "order_items"("product_variant_id");

-- CreateIndex
CREATE INDEX "order_items_offer_id_foreign" ON "order_items"("offer_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_code_unique" ON "payment_methods"("code");

-- CreateIndex
CREATE UNIQUE INDEX "gift_cards_code_unique" ON "gift_cards"("code");

-- CreateIndex
CREATE INDEX "gift_cards_currency_id_foreign" ON "gift_cards"("currency_id");

-- CreateIndex
CREATE INDEX "gift_cards_purchased_by_foreign" ON "gift_cards"("purchased_by");

-- CreateIndex
CREATE INDEX "gift_cards_recipient_id_foreign" ON "gift_cards"("recipient_id");

-- CreateIndex
CREATE INDEX "order_addresses_order_id_foreign" ON "order_addresses"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_tracking_number_unique" ON "shipments"("tracking_number");

-- CreateIndex
CREATE INDEX "shipments_order_id_index" ON "shipments"("order_id");

-- CreateIndex
CREATE INDEX "shipments_tracking_number_index" ON "shipments"("tracking_number");

-- CreateIndex
CREATE INDEX "shipments_status_index" ON "shipments"("status");

-- CreateIndex
CREATE INDEX "shipments_carrier_index" ON "shipments"("carrier");

-- CreateIndex
CREATE INDEX "shipment_items_shipment_id_index" ON "shipment_items"("shipment_id");

-- CreateIndex
CREATE INDEX "shipment_items_order_item_id_foreign" ON "shipment_items"("order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "shipment_items_shipment_id_order_item_id_unique" ON "shipment_items"("shipment_id", "order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "returns_return_number_unique" ON "returns"("return_number");

-- CreateIndex
CREATE INDEX "returns_return_number_index" ON "returns"("return_number");

-- CreateIndex
CREATE INDEX "returns_order_id_index" ON "returns"("order_id");

-- CreateIndex
CREATE INDEX "returns_customer_id_index" ON "returns"("customer_id");

-- CreateIndex
CREATE INDEX "returns_status_index" ON "returns"("status");

-- CreateIndex
CREATE INDEX "returns_refund_payment_id_foreign" ON "returns"("refund_payment_id");

-- CreateIndex
CREATE INDEX "return_items_return_id_index" ON "return_items"("return_id");

-- CreateIndex
CREATE INDEX "return_items_order_item_id_index" ON "return_items"("order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_unique" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "home_sections_is_active_index" ON "home_sections"("is_active");

-- CreateIndex
CREATE INDEX "home_sections_type_index" ON "home_sections"("type");

-- CreateIndex
CREATE INDEX "home_page_sections_status_index" ON "home_page_sections"("status");

-- CreateIndex
CREATE INDEX "home_page_sections_sort_order_index" ON "home_page_sections"("sort_order");

-- CreateIndex
CREATE INDEX "home_page_sections_type_index" ON "home_page_sections"("type");

-- CreateIndex
CREATE INDEX "order_status_history_order_id_index" ON "order_status_history"("order_id");

-- CreateIndex
CREATE INDEX "order_status_history_status_index" ON "order_status_history"("status");

-- CreateIndex
CREATE INDEX "order_status_history_created_at_index" ON "order_status_history"("created_at");

-- CreateIndex
CREATE INDEX "order_status_history_admin_id_foreign" ON "order_status_history"("admin_id");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_stocks_warehouse_id_product_variant_id_unique" ON "warehouse_stocks"("warehouse_id", "product_variant_id");

-- CreateIndex
CREATE INDEX "wishlist_items_wishlist_id_foreign" ON "wishlist_items"("wishlist_id");

-- CreateIndex
CREATE INDEX "wishlist_items_product_variant_id_foreign" ON "wishlist_items"("product_variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_code_unique" ON "notification_templates"("code");

-- CreateIndex
CREATE INDEX "notification_templates_code_index" ON "notification_templates"("code");

-- CreateIndex
CREATE INDEX "notification_templates_type_index" ON "notification_templates"("type");

-- CreateIndex
CREATE INDEX "notification_templates_trigger_event_index" ON "notification_templates"("trigger_event");

-- CreateIndex
CREATE INDEX "payments_order_id_foreign" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "payments_currency_id_foreign" ON "payments"("currency_id");

-- CreateIndex
CREATE INDEX "customer_loyalty_customer_id_foreign" ON "customer_loyalty"("customer_id");

-- CreateIndex
CREATE INDEX "customer_loyalty_loyalty_program_id_foreign" ON "customer_loyalty"("loyalty_program_id");

-- CreateIndex
CREATE INDEX "loyalty_transactions_customer_loyalty_id_foreign" ON "loyalty_transactions"("customer_loyalty_id");

-- CreateIndex
CREATE INDEX "loyalty_transactions_customer_id_foreign" ON "loyalty_transactions"("customer_id");

-- CreateIndex
CREATE INDEX "customer_addresses_customer_id_foreign" ON "customer_addresses"("customer_id");

-- CreateIndex
CREATE INDEX "gift_card_transactions_gift_card_id_foreign" ON "gift_card_transactions"("gift_card_id");

-- CreateIndex
CREATE INDEX "gift_card_transactions_customer_id_foreign" ON "gift_card_transactions"("customer_id");

-- CreateIndex
CREATE INDEX "customer_segment_members_customer_id_foreign" ON "customer_segment_members"("customer_id");

-- CreateIndex
CREATE INDEX "customer_segment_members_customer_segment_id_foreign" ON "customer_segment_members"("customer_segment_id");

-- CreateIndex
CREATE INDEX "offers_customer_segment_id_foreign" ON "offers"("customer_segment_id");

-- CreateIndex
CREATE INDEX "offer_categories_offer_id_foreign" ON "offer_categories"("offer_id");

-- CreateIndex
CREATE INDEX "offer_categories_category_id_foreign" ON "offer_categories"("category_id");

-- CreateIndex
CREATE INDEX "offer_rewards_offer_id_foreign" ON "offer_rewards"("offer_id");

-- CreateIndex
CREATE INDEX "offer_rewards_reward_product_id_foreign" ON "offer_rewards"("reward_product_id");

-- CreateIndex
CREATE INDEX "offer_usages_offer_id_foreign" ON "offer_usages"("offer_id");

-- CreateIndex
CREATE INDEX "offer_usages_customer_id_foreign" ON "offer_usages"("customer_id");

-- CreateIndex
CREATE INDEX "offer_variants_offer_id_foreign" ON "offer_variants"("offer_id");

-- CreateIndex
CREATE INDEX "offer_variants_product_variant_id_foreign" ON "offer_variants"("product_variant_id");

-- CreateIndex
CREATE INDEX "payment_attempts_order_id_foreign" ON "payment_attempts"("order_id");

-- CreateIndex
CREATE INDEX "payment_attempts_currency_id_foreign" ON "payment_attempts"("currency_id");

-- CreateIndex
CREATE INDEX "popup_stats_popup_id_foreign" ON "popup_stats"("popup_id");

-- CreateIndex
CREATE INDEX "popup_stats_customer_id_foreign" ON "popup_stats"("customer_id");

-- CreateIndex
CREATE INDEX "price_histories_product_variant_id_foreign" ON "price_histories"("product_variant_id");

-- CreateIndex
CREATE INDEX "specification_values_specification_id_foreign" ON "specification_values"("specification_id");

-- CreateIndex
CREATE INDEX "shipping_charges_shipping_zone_id_foreign" ON "shipping_charges"("shipping_zone_id");

-- CreateIndex
CREATE INDEX "shipping_charges_shipping_method_id_foreign" ON "shipping_charges"("shipping_method_id");

-- CreateIndex
CREATE INDEX "product_reviews_product_id_foreign" ON "product_reviews"("product_id");

-- CreateIndex
CREATE INDEX "product_reviews_customer_id_foreign" ON "product_reviews"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "_TaxClassToTaxRate_AB_unique" ON "_TaxClassToTaxRate"("A", "B");

-- CreateIndex
CREATE INDEX "_TaxClassToTaxRate_B_index" ON "_TaxClassToTaxRate"("B");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_blocked_by_fkey" FOREIGN KEY ("blocked_by") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_trails" ADD CONSTRAINT "audit_trails_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_trails" ADD CONSTRAINT "audit_trails_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_values" ADD CONSTRAINT "attribute_values_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_values" ADD CONSTRAINT "attribute_values_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spec_group_specs" ADD CONSTRAINT "spec_group_specs_specification_group_id_fkey" FOREIGN KEY ("specification_group_id") REFERENCES "specification_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spec_group_specs" ADD CONSTRAINT "spec_group_specs_specification_id_fkey" FOREIGN KEY ("specification_id") REFERENCES "specifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brands" ADD CONSTRAINT "brands_logo_id_fkey" FOREIGN KEY ("logo_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_attributes" ADD CONSTRAINT "category_attributes_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_attributes" ADD CONSTRAINT "category_attributes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_spec_groups" ADD CONSTRAINT "category_spec_groups_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_spec_groups" ADD CONSTRAINT "category_spec_groups_specification_group_id_fkey" FOREIGN KEY ("specification_group_id") REFERENCES "specification_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_main_category_id_fkey" FOREIGN KEY ("main_category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_tax_class_id_fkey" FOREIGN KEY ("tax_class_id") REFERENCES "tax_classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_product" ADD CONSTRAINT "category_product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_product" ADD CONSTRAINT "category_product_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_specification_id_fkey" FOREIGN KEY ("specification_id") REFERENCES "specifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_specification_value_id_fkey" FOREIGN KEY ("specification_value_id") REFERENCES "specification_values"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_attributes" ADD CONSTRAINT "variant_attributes_attribute_value_id_fkey" FOREIGN KEY ("attribute_value_id") REFERENCES "attribute_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_attributes" ADD CONSTRAINT "variant_attributes_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_images" ADD CONSTRAINT "variant_images_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_images" ADD CONSTRAINT "variant_images_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "related_products" ADD CONSTRAINT "related_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "related_products" ADD CONSTRAINT "related_products_related_product_id_fkey" FOREIGN KEY ("related_product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cross_sell_products" ADD CONSTRAINT "cross_sell_products_cross_sell_product_id_fkey" FOREIGN KEY ("cross_sell_product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cross_sell_products" ADD CONSTRAINT "cross_sell_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upsell_products" ADD CONSTRAINT "upsell_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upsell_products" ADD CONSTRAINT "upsell_products_up_sell_product_id_fkey" FOREIGN KEY ("up_sell_product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tier_prices" ADD CONSTRAINT "tier_prices_customer_segment_id_fkey" FOREIGN KEY ("customer_segment_id") REFERENCES "customer_segments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tier_prices" ADD CONSTRAINT "tier_prices_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transfers" ADD CONSTRAINT "inventory_transfers_from_warehouse_id_fkey" FOREIGN KEY ("from_warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transfers" ADD CONSTRAINT "inventory_transfers_to_warehouse_id_fkey" FOREIGN KEY ("to_warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transfer_items" ADD CONSTRAINT "inventory_transfer_items_inventory_transfer_id_fkey" FOREIGN KEY ("inventory_transfer_id") REFERENCES "inventory_transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transfer_items" ADD CONSTRAINT "inventory_transfer_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transfer_items" ADD CONSTRAINT "inventory_transfer_items_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_history" ADD CONSTRAINT "stock_history_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_history" ADD CONSTRAINT "stock_history_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_collections" ADD CONSTRAINT "item_collections_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_collection_items" ADD CONSTRAINT "item_collection_items_item_collection_id_fkey" FOREIGN KEY ("item_collection_id") REFERENCES "item_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_collection_items" ADD CONSTRAINT "item_collection_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_collection_items" ADD CONSTRAINT "item_collection_items_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "states" ADD CONSTRAINT "states_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_rewards" ADD CONSTRAINT "promotion_rewards_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_rewards" ADD CONSTRAINT "promotion_rewards_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "rewards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_usages" ADD CONSTRAINT "reward_usages_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_usages" ADD CONSTRAINT "reward_usages_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "rewards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_product_review_id_fkey" FOREIGN KEY ("product_review_id") REFERENCES "product_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_images" ADD CONSTRAINT "review_images_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_images" ADD CONSTRAINT "review_images_product_review_id_fkey" FOREIGN KEY ("product_review_id") REFERENCES "product_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "notification_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_method_id_fkey" FOREIGN KEY ("shipping_method_id") REFERENCES "shipping_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_purchased_by_fkey" FOREIGN KEY ("purchased_by") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_addresses" ADD CONSTRAINT "order_addresses_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment_items" ADD CONSTRAINT "shipment_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment_items" ADD CONSTRAINT "shipment_items_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_return_id_fkey" FOREIGN KEY ("return_id") REFERENCES "returns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_stocks" ADD CONSTRAINT "warehouse_stocks_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_stocks" ADD CONSTRAINT "warehouse_stocks_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_wishlist_id_fkey" FOREIGN KEY ("wishlist_id") REFERENCES "wishlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_loyalty" ADD CONSTRAINT "customer_loyalty_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_loyalty" ADD CONSTRAINT "customer_loyalty_loyalty_program_id_fkey" FOREIGN KEY ("loyalty_program_id") REFERENCES "loyalty_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_customer_loyalty_id_fkey" FOREIGN KEY ("customer_loyalty_id") REFERENCES "customer_loyalty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_card_transactions" ADD CONSTRAINT "gift_card_transactions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_card_transactions" ADD CONSTRAINT "gift_card_transactions_gift_card_id_fkey" FOREIGN KEY ("gift_card_id") REFERENCES "gift_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_segment_members" ADD CONSTRAINT "customer_segment_members_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_segment_members" ADD CONSTRAINT "customer_segment_members_customer_segment_id_fkey" FOREIGN KEY ("customer_segment_id") REFERENCES "customer_segments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_customer_segment_id_fkey" FOREIGN KEY ("customer_segment_id") REFERENCES "customer_segments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_categories" ADD CONSTRAINT "offer_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_categories" ADD CONSTRAINT "offer_categories_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_rewards" ADD CONSTRAINT "offer_rewards_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_rewards" ADD CONSTRAINT "offer_rewards_reward_product_id_fkey" FOREIGN KEY ("reward_product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_rewards" ADD CONSTRAINT "offer_rewards_reward_variant_id_fkey" FOREIGN KEY ("reward_variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_usages" ADD CONSTRAINT "offer_usages_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_usages" ADD CONSTRAINT "offer_usages_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_usages" ADD CONSTRAINT "offer_usages_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_variants" ADD CONSTRAINT "offer_variants_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_variants" ADD CONSTRAINT "offer_variants_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "popup_stats" ADD CONSTRAINT "popup_stats_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "popup_stats" ADD CONSTRAINT "popup_stats_popup_id_fkey" FOREIGN KEY ("popup_id") REFERENCES "popups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_histories" ADD CONSTRAINT "price_histories_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specification_values" ADD CONSTRAINT "specification_values_specification_id_fkey" FOREIGN KEY ("specification_id") REFERENCES "specifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_charges" ADD CONSTRAINT "shipping_charges_shipping_method_id_fkey" FOREIGN KEY ("shipping_method_id") REFERENCES "shipping_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_charges" ADD CONSTRAINT "shipping_charges_shipping_zone_id_fkey" FOREIGN KEY ("shipping_zone_id") REFERENCES "shipping_zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaxClassToTaxRate" ADD CONSTRAINT "_TaxClassToTaxRate_A_fkey" FOREIGN KEY ("A") REFERENCES "tax_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaxClassToTaxRate" ADD CONSTRAINT "_TaxClassToTaxRate_B_fkey" FOREIGN KEY ("B") REFERENCES "tax_rates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

