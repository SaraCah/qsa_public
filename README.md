# QSA Public

## Doing it.

```
./bootstrap.sh

## create database
# create database qsa_public character set UTF8mb4 collate utf8mb4_bin;
# grant all on qsa_public.* to 'qsa'@'localhost' identified by 'qsa123';

# add a config.local.rb
AppConfig[:db_url] = "jdbc:mysql://localhost:3306/qsa_public?useUnicode=true&characterEncoding=UTF-8&user=qsa&password=qsa123"

./scripts/setup_database.sh
./scripts/devserver.sh

Profit at http://localhost:3333
```
