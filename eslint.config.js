const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');
module.exports = defineConfig([expo, { ignores: ['dist/**', 'supabase/functions/**', '.claude/**', 'test-results/**', 'playwright-report/**', 'milo-design/**'] }]);
