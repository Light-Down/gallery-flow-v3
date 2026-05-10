/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Create Auth-Users for all existing galleries
 *
 * For each gallery record, creates an Auth-User in the `users` collection.
 * The gallery slug becomes the username (PocketBase accepts slug format).
 * Password is passed plaintext — PocketBase bcrypt-hashes it on save.
 *
 * Idempotent: skips galleries that already have a userId.
 */
migrate((db) => {
  const dao = new Dao(db);

  const galleriesCollection = dao.findCollectionByNameOrId("galleries");
  const usersCollection = dao.findCollectionByNameOrId("users");

  // Ensure userId field exists on galleries collection
  let userIdField = galleriesCollection.schema.getFieldByName("userId");
  if (!userIdField) {
    userIdField = new SchemaField({
      name: "userId",
      type: "text",
      required: false,
    });
    galleriesCollection.schema.addField(userIdField);
    dao.saveCollection(galleriesCollection);
  }

  // Find all galleries that don't have a userId yet
  const galleries = dao.findRecordsByFilter(
    "galleries",
    "userId = '' || userId = null",
    "",
    0,
    0
  );

  for (const gallery of galleries) {
    // Skip if already has userId (double-check for idempotency)
    const existingUserId = gallery.get("userId");
    if (existingUserId && existingUserId !== "") {
      continue;
    }

    try {
      // Gallery slug becomes the Auth-User username
      const slug = gallery.get("slug");
      const password = gallery.get("password");
      const title = gallery.get("title");

      if (!slug || !password) {
        console.log(`Skipping gallery ${gallery.id}: missing slug or password`);
        continue;
      }

      const user = new Record(usersCollection, {
        username: slug,
        password: password,
        passwordConfirm: password,
        name: title || slug,
      });

      const savedUser = dao.saveRecord(user);
      gallery.set("userId", savedUser.id);
      dao.saveRecord(gallery);

      console.log(`Created Auth-User for gallery ${slug}: ${savedUser.id}`);
    } catch (e) {
      console.log(`Failed to create user for gallery ${gallery.id}: ${e.message}`);
    }
  }
}, (db) => {
  // Revert: remove userId field from galleries
  try {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("galleries");
    collection.schema.removeField("userId");
    dao.saveCollection(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
});
