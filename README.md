Rails & Gulp Environment
==========

## Rails Usage

### Installing

```
bundle install --path vendor/bundle
```

### Data setting

```
// seed
// not set now
```

### rails server

```
bundle exec rails s
```

## Gulp Usage

### Installing packages and dependencies

- Global
```
npm install -g gulp
npm install -g easymock
```

- Local
```
npm install
bower install
```

- easymock
```
cd easymock
easymock -p 8080
```

### Gulp command

- development
```
gulp server
```

- deploy optim
```
gulp build
gulp optim
```

