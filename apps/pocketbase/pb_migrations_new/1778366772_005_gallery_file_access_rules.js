/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Set file access rules for galleryImages field
 *
 * Requires authentication for all gallery image file access.
 * Sets collection-level rules and file access rules on the galleryImages field.
 *
 * Idempotent: checks if rules are already set before modifying.
 */
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("galleries");

  // Require authentication for all collection operations
  const authRule = "@request.auth.id != ''";

  if (collection.viewRule !== authRule) {
    collection.viewRule = authRule;
  }
  if (collection.listRule !== authRule) {
    collection.listRule = authRule;
  }
  if (collection.createRule !== authRule) {
    collection.createRule = authRule;
  }
  if (collection.updateRule !== authRule) {
    collection.updateRule = authRule;
  }
  if (collection.deleteRule !== authRule) {
    collection.deleteRule = authRule;
  }

  // Set file access rule on the galleryImages field if it exists
  // Note: galleryImages field is created in migration 007
  const galleryImagesField = collection.schema.getFieldByName("galleryImages");
  if (galleryImagesField) {
    // File access rules in PocketBase are set via the field's options
    galleryImagesField.options = galleryImagesField.options || {};
    if (galleryImagesField.options.protected !== true) {
      galleryImagesField.options.protected = true;
      collection.schema.removeField("galleryImages");
      collection.schema.addField(galleryImagesField);
    }
  }

  // Set collection-level file token rule for additional protection
  collection.options = collection.options || {};
  if (collection.options.fileToken !== authRule) {
    collection.options.fileToken = authRule;
  }

  dao.saveCollection(collection);
}, (db) => {
  // Revert: restore public access
  try {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("galleries");

    collection.viewRule = null;
    collection.listRule = null;
    collection.createRule = null;
    collection.updateRule = null;
    collection.deleteRule = null;

    if (collection.options) {
      delete collection.options.fileToken;
    }

    dao.saveCollection(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
});
