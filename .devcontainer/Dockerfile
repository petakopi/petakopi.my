ARG RUBY_VERSION=3.4.1
ARG NODE_VERSION=22.11.0

FROM ruby:3.4.1-slim AS builder

WORKDIR /workspaces

# Install system dependencies
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential \
    curl \
    git \
    pkg-config \
    libffi-dev \
    libpq-dev \
    libvips \
    postgresql-client \
    node-gyp \
    python-is-python3 \
    sudo && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Configure bundler
ENV BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_BIN=/usr/local/bundle/bin \
    GEM_HOME=/usr/local/bundle \
    BUNDLE_APP_CONFIG=/usr/local/bundle \
    PATH=/usr/local/bundle/bin:$PATH

# Install Node.js and pnpm
ARG NODE_VERSION=22.11.0
ENV PATH=/usr/local/node/bin:$PATH
RUN curl -sL https://github.com/nodenv/node-build/archive/master.tar.gz | tar xz -C /tmp/ && \
    /tmp/node-build-master/bin/node-build "${NODE_VERSION}" /usr/local/node && \
    npm install -g pnpm && \
    rm -rf /tmp/node-build-master

# Create non-root user
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME \
    && mkdir -p /usr/local/bundle \
    && chown -R $USERNAME:$USERNAME /usr/local/bundle
