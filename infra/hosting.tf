resource "google_firebase_hosting_site" "launchpad" {
  provider = google-beta
  project  = google_project.default.project_id
  app_id = google_firebase_web_app.launchpad.app_id
  site_id = google_project.default.project_id
}
