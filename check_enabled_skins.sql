SELECT column_name
FROM information_schema.columns
WHERE table_name = 'profiles'
    AND column_name = 'enabled_skins';