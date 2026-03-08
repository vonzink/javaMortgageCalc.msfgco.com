-- Admin user (password: admin123)
INSERT INTO users (email, name, initials, role, password_hash)
VALUES ('admin@msfginfo.com', 'Admin', 'A', 'admin', '$2b$10$UhQe3Yh0wSJGkWcK65NIx.DquGscMGtMpFS5.eRwPvP7LAQ9pFKNe');

-- Site config defaults
INSERT INTO site_config (config_key, config_value) VALUES ('siteName', 'MSFG Calculator Suite');
INSERT INTO site_config (config_key, config_value) VALUES ('companyName', 'Mountain State Financial Group LLC');
INSERT INTO site_config (config_key, config_value) VALUES ('nmls', '1314257');
INSERT INTO site_config (config_key, config_value) VALUES ('domain', 'msfginfo.com');
INSERT INTO site_config (config_key, config_value) VALUES ('logoSrc', '/images/msfg-logo.png');
INSERT INTO site_config (config_key, config_value) VALUES ('aiProvider', '');
INSERT INTO site_config (config_key, config_value) VALUES ('aiApiKey', '');
