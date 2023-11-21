locals {
  collections = {
    deployments = "deployments"
  }
}

resource "google_firestore_database" "default" {
  project     = google_project.default.project_id
  name        = "(default)"
  location_id = "eur3"
  type        = "FIRESTORE_NATIVE"

  depends_on = [google_project_service.default["firestore.googleapis.com"]]

  # Prevents accidental deletion of the database.
  # To delete the database, first set this field to `DELETE_PROTECTION_DISABLED`, apply the changes.
  # Then delete the database resource and apply the changes again.
  delete_protection_state = "DELETE_PROTECTION_ENABLED"
}


resource "google_firestore_field" "ttl" {
  field = "ttl"
  project = google_project.default.project_id
  collection = local.collections.deployments

  # Enable a TTL policy based on the value of entries with this field.
  ttl_config {}

  # Disable all single field indexes for this field because indexes on timestamps create hotspots.
  index_config {}
}
