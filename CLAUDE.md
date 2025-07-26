# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

petakopi.my is a Ruby on Rails 8.0.1 application serving as a coffee shop directory for Malaysia. It combines a Rails backend with modern React components and uses PostGIS for geospatial features.

## Development Setup

### Recommended: Development Containers
```bash
# Open in VS Code with Dev Containers extension
# Use "Reopen in Container" command
# Then run in container:
./bin/rails s      # Rails server on port 3000
./bin/vite dev     # Vite development server
```

### Alternative: Local Setup
```bash
bin/setup          # Initial setup (creates DB, installs dependencies)
bin/dev           # Start all services via Foreman
# OR separately:
bin/rails server   # Rails server
bin/vite dev      # Vite development server
```

## Common Development Commands

### Database Operations
```bash
bin/rails db:prepare        # Create and migrate database
bin/rails db:migrate        # Run pending migrations
rails seeder:tags          # Seed development data with tags
```

### Testing
```bash
bundle exec rspec          # Run full RSpec test suite
bundle exec rspec spec/path/to/file_spec.rb    # Run specific test file
```

### Code Quality
```bash
bundle exec standardrb     # Ruby linting (Standard Ruby style)
```

### File Editing Standards
When editing files, always ensure:
- **No trailing whitespace**: Remove any trailing spaces or tabs at the end of lines
- **Consistent indentation**: Follow the existing indentation style (2 spaces for Ruby)
- **Clean line endings**: Ensure proper line endings without extra blank lines
- **Standard Ruby formatting**: Follow StandardRB conventions for Ruby files

### URL Generation Standards
When generating URLs for coffee shops:
- **Always use slug instead of ID**: Use `main_coffee_shop_url(id: coffee_shop.slug)` pattern
- **SEO-friendly URLs**: Ensures URLs are readable and SEO-optimized
- **Consistent with API**: Matches the pattern used in `app/views/api/v1/coffee_shops/_coffee_shop.json.jbuilder`

### Asset Management
```bash
pnpm install              # Install Node.js dependencies
pnpm run build           # Build JavaScript assets
pnpm run build:css       # Build CSS assets
bin/vite build           # Vite production build
```

### Package Manager Version Management
The project uses pnpm with version pinning for consistency across environments:
- **Local Development**: Version specified in `package.json` `packageManager` field
- **Docker/Kamal Deployments**: Version specified via `PNPM_VERSION` build argument in Dockerfile (defaults to 10.13.1)
- **Updating pnpm**: Update both locations when upgrading:
  1. `package.json`: `"packageManager": "pnpm@X.X.X"`
  2. `Dockerfile`: `ARG PNPM_VERSION=X.X.X`

### Background Jobs
```bash
bundle exec sidekiq      # Start Sidekiq worker for background jobs
```

## Architecture Overview

### Technology Stack
- **Backend**: Rails 8.0.1 with Ruby 3.4.1
- **Database**: PostgreSQL with PostGIS for geospatial data
- **Frontend**: React 19.0.0 components integrated with Rails views
- **Styling**: TailwindCSS with custom brown color scheme
- **JavaScript**: Stimulus controllers + Vite for asset bundling
- **Maps**: Mapbox GL for interactive mapping
- **Background Jobs**: Sidekiq with Redis
- **Authentication**: Devise with OAuth (Google, Facebook, Twitter)

### Code Organization Patterns

#### Domain Architecture
- **Services**: Business logic classes (e.g., `AvatarProcessor`, `GoogleLocationSyncer`)
- **Use Cases**: Command pattern using `u-case` gem for complex operations
- **Decorators**: View logic using `active_decorator` gem
- **Queries**: Database query objects for complex filtering (e.g., `CoffeeShopsListQuery`)
- **Forms**: Form objects for complex validations
- **Workers**: Sidekiq background job classes
- **Presenters**: View data preparation

#### Frontend Integration
- **React Components**: Complex UI (maps, filtering) mounted via `turbo-mount`
- **Stimulus Controllers**: Progressive enhancement and simple interactions
- **Turbo Streams**: Dynamic page updates without full reloads

### Key Models and Relationships
- **CoffeeShop**: Central model with PostGIS location data, tags, and rich associations
- **User**: Authentication with social providers, bookmarks, and collections
- **Tag**: Categorization system with groups and positioning
- **OpeningHour**: Time-based data with status calculations
- **Auction/Bid**: Premium listing system
- **GeoLocation**: PostGIS-enabled location management

### Environment Configuration
Place environment variables in `.env.development.local`:
- Google APIs (Maps, Places, OAuth)
- Mapbox API key
- Cloudflare Turnstile
- Various service credentials (see README for full list)

## Development Notes

### React Components Location
React components are in `app/javascript/components/` and mounted in Rails views using the `turbo-mount` library.

### PostGIS Usage
The application heavily uses PostGIS for geospatial queries. Location data is stored in the `geo_locations` table with proper spatial indexing.

### Background Job Processing
Sidekiq handles various background tasks including Google API syncing, image processing, and notification sending. Check `app/workers/` for all job classes.

### API Endpoints
API controllers in `app/controllers/api/v1/` provide JSON responses using Jbuilder templates. The API supports pagination via Pagy.

### Image Processing
Active Storage with image optimization via TinyPNG and image_optim gems. Multiple processors handle logos, covers, and avatars.

### Testing Framework
RSpec is used for testing with FactoryBot for fixtures. Test files follow standard Rails conventions in the `spec/` directory.