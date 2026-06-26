SELECT pm.type, m.file_path, m.file_name 
FROM "product_media" pm
JOIN "media" m ON pm."media_id" = m.id
WHERE pm."product_id" = 20;
