resource "google_firebase_web_app" "launchpad" {
  provider = google-beta
  project = google_project.default.project_id
  display_name = "Launchpad"
}
