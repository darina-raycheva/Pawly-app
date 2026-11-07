# Настройване на кориците на статии

Тази настройка е отделна от миграцията и не се прилага автоматично.

1. В Supabase Dashboard отворете **Storage** → **New bucket**.
2. Създайте bucket с име `article-covers`.
3. Оставете bucket-а **Private**. Не активирайте публичен достъп.
4. Задайте ограниченията на bucket-а:
   - **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`
   - **File size limit:** `5 MB` (или `5242880` bytes)
5. Прегледайте и приложете локално
   [`20261107220000_add_article_cover_images.sql`](./migrations/20261107220000_add_article_cover_images.sql)
   след pending RBAC/article migration
   [`20261107213000_create_roles_and_articles.sql`](./migrations/20261107213000_create_roles_and_articles.sql).

Политиките позволяват качване, промяна и изтриване само на администратори.
Анонимни и влезли потребители могат да четат само обекти, посочени като корица
на публикувана статия. Името на файла е `UUID/filename.ext`; приложението
валидира MIME type и размер преди качване. Bucket-level ограниченията са
необходими, защото MIME type и размерът от браузъра не са доверена граница.
Upload path-ът трябва да започва с UUID на текущия администратор.

Важно: браузърът изпраща JPG файловете с MIME type `image/jpeg`, не `image/jpg`.
В Supabase трябва да бъде разрешено точно `image/jpeg`; `image/jpg` не е
заместител и води до `InvalidMimeType`.
