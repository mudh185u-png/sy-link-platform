-- Command Center Setup
-- Add new keys to platform_settings for global control
DO $$ BEGIN -- Maintenance Mode
IF NOT EXISTS (
    SELECT 1
    FROM platform_settings
    WHERE key = 'maintenance_mode'
) THEN
INSERT INTO platform_settings (key, value)
VALUES ('maintenance_mode', 'false');
END IF;
-- Registration Enabled
IF NOT EXISTS (
    SELECT 1
    FROM platform_settings
    WHERE key = 'registration_enabled'
) THEN
INSERT INTO platform_settings (key, value)
VALUES ('registration_enabled', 'true');
END IF;
-- System Announcement
IF NOT EXISTS (
    SELECT 1
    FROM platform_settings
    WHERE key = 'system_announcement'
) THEN
INSERT INTO platform_settings (key, value)
VALUES (
        'system_announcement',
        '{"message": "", "color": "#ff2d55", "active": "false"}'
    );
END IF;
-- Global Skin Control (Hidden Skins)
IF NOT EXISTS (
    SELECT 1
    FROM platform_settings
    WHERE key = 'hidden_skins'
) THEN
INSERT INTO platform_settings (key, value)
VALUES ('hidden_skins', '[]');
END IF;
-- Page Visibility Control
IF NOT EXISTS (
    SELECT 1
    FROM platform_settings
    WHERE key = 'disabled_pages'
) THEN
INSERT INTO platform_settings (key, value)
VALUES ('disabled_pages', '[]');
END IF;
END $$;