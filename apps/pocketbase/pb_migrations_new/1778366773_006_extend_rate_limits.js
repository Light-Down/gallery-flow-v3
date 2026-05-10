/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Extend rate limits for gallery authentication
 *
 * Adds rate limit rules for gallery auth endpoints:
 * - POST /api/collections/users/auth-with-password: 10 req / 5 min per IP (guests)
 * - POST /api/collections/galleries/auth-with-password: 10 req / 5 min per IP (guests)
 *
 * Preserves all existing rate limit rules.
 * Idempotent: checks if rules already exist before adding.
 */
migrate((db) => {
  const dao = new Dao(db);

  // Read existing settings
  const settings = dao.findSettings();
  const existingRules = settings.rateLimits?.rules || [];

  // Define new rate limit rules for gallery auth
  const newRules = [
    {
      label: "POST /api/collections/users/auth-with-password",
      audience: "@guest",
      duration: 300, // 5 minutes
      maxRequests: 10,
    },
    {
      label: "POST /api/collections/galleries/auth-with-password",
      audience: "@guest",
      duration: 300, // 5 minutes
      maxRequests: 10,
    },
  ];

  // Add only rules that don't already exist (idempotent)
  for (const newRule of newRules) {
    const exists = existingRules.some(
      (rule) => rule.label === newRule.label
    );
    if (!exists) {
      existingRules.push(newRule);
      console.log(`Added rate limit rule: ${newRule.label}`);
    } else {
      console.log(`Rate limit rule already exists: ${newRule.label}`);
    }
  }

  // Ensure rate limits are enabled
  settings.rateLimits = settings.rateLimits || {};
  settings.rateLimits.enabled = true;
  settings.rateLimits.rules = existingRules;

  dao.saveSettings(settings);
}, (db) => {
  // Revert: remove the gallery auth rate limit rules
  try {
    const dao = new Dao(db);
    const settings = dao.findSettings();

    if (settings.rateLimits?.rules) {
      const labelsToRemove = [
        "POST /api/collections/users/auth-with-password",
        "POST /api/collections/galleries/auth-with-password",
      ];

      settings.rateLimits.rules = settings.rateLimits.rules.filter(
        (rule) => !labelsToRemove.includes(rule.label)
      );

      dao.saveSettings(settings);
      console.log("Removed gallery auth rate limit rules");
    }
  } catch (e) {
    console.log(`Failed to revert rate limits: ${e.message}`);
    throw e;
  }
});
