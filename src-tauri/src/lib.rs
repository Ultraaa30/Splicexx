use tauri::{WebviewUrl, WebviewWindowBuilder};

const SPLICE_HELPER_LABEL: &str = "splice-helper";
const SPLICE_HELPER_URL: &str = "https://splice.com/sounds/search/samples";

const SPLICE_HELPER_INIT: &str = r#"
(function () {
  if (window.__spliceHelperReady) return;
  window.__spliceHelperReady = true;

  var GRAPHQL_URL = "https://surfaces-graphql.splice.com/graphql";

  function getEventApi() {
    if (window.__TAURI__ && window.__TAURI__.event) {
      return window.__TAURI__.event;
    }
    var internals = window.__TAURI_INTERNALS__;
    if (!internals || !internals.invoke || !internals.transformCallback) {
      return null;
    }
    return {
      emit: function (event, payload) {
        return internals.invoke("plugin:event|emit", { event: event, payload: payload });
      },
      listen: function (event, handler) {
        return internals.invoke("plugin:event|listen", {
          event: event,
          target: { kind: "Any" },
          handler: internals.transformCallback(handler)
        });
      }
    };
  }

  function start() {
    var event = getEventApi();
    if (!event) { setTimeout(start, 100); return; }

    event.listen("splice-search", async function (msg) {
      var id = msg.payload.id;
      var body = msg.payload.body;
      var lastErr = null;

      for (var attempt = 0; attempt < 4; attempt++) {
        try {
          var resp = await fetch(GRAPHQL_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: body
          });
          var text = await resp.text();
          if (resp.ok) {
            event.emit("splice-result", { id: id, ok: true, body: text });
            return;
          }
          lastErr = "Splice returned HTTP " + resp.status;
        } catch (e) {
          lastErr = String(e);
        }
        await new Promise(function (r) { setTimeout(r, 700); });
      }

      event.emit("splice-result", { id: id, ok: false, error: lastErr || "unknown error" });
    });
  }

  start();
})();
"#;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_window_state::Builder::new()
                .with_denylist(&[SPLICE_HELPER_LABEL])
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_drag::init())
        .setup(|app| {
            WebviewWindowBuilder::new(
                app,
                SPLICE_HELPER_LABEL,
                WebviewUrl::External(SPLICE_HELPER_URL.parse().unwrap()),
            )
            .title("splice-helper")
            .visible(false)
            .skip_taskbar(true)
            .initialization_script(SPLICE_HELPER_INIT)
            .build()?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
