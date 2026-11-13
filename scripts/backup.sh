#!/bin/sh
set -eu
mkdir -p backups
stamp=$(date +%Y%m%d)
pg_dump "$DATABASE_URL" > "backups/db-$stamp.sql"
if [ -d public/uploads ]; then
  tar -czf "backups/photos-$stamp.tar.gz" public/uploads
fi
find backups -mtime +7 -delete
