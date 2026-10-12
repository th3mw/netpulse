use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri::Emitter;


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InterfaceSummary {
    pub name: String,
    pub is_up: bool,
    pub in_database: bool,
    pub rx_bytes: u64,
    pub tx_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LiveRateSample {
    pub interface: String,
    pub timestamp_ms: u128,
    pub rx_bytes_per_sec: u64,
    pub tx_bytes_per_sec: u64,
    pub rx_packets_per_sec: u64,
    pub tx_packets_per_sec: u64,
    pub total_rx_bytes: u64,
    pub total_tx_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PercentileReport {
    pub interface: String,
    pub period_info: String,
    pub rx_min_str: String,
    pub rx_avg_str: String,
    pub rx_max_str: String,
    pub rx_95th_str: String,
    pub tx_min_str: String,
    pub tx_avg_str: String,
    pub tx_max_str: String,
    pub tx_95th_str: String,
    pub total_min_str: String,
    pub total_avg_str: String,
    pub total_max_str: String,
    pub total_95th_str: String,
}

struct NetDevSnapshot {
    timestamp: Instant,
    rx_bytes: u64,
    rx_packets: u64,
    tx_bytes: u64,
    tx_packets: u64,
}

type DevStatsMap = Arc<Mutex<HashMap<String, NetDevSnapshot>>>;

fn read_proc_net_dev() -> Result<HashMap<String, (u64, u64, u64, u64)>, String> {
    #[cfg(target_os = "linux")]
    {
        let content = fs::read_to_string("/proc/net/dev")
            .map_err(|e| format!("Failed to read /proc/net/dev: {}", e))?;
        let mut map = HashMap::new();

        for line in content.lines().skip(2) {
            let parts: Vec<&str> = line.split(':').collect();
            if parts.len() != 2 {
                continue;
            }
            let iface = parts[0].trim().to_string();
            let stats: Vec<&str> = parts[1].split_whitespace().collect();
            if stats.len() < 10 {
                continue;
            }

            let rx_bytes = stats[0].parse::<u64>().unwrap_or(0);
            let rx_packets = stats[1].parse::<u64>().unwrap_or(0);
            let tx_bytes = stats[8].parse::<u64>().unwrap_or(0);
            let tx_packets = stats[9].parse::<u64>().unwrap_or(0);

            map.insert(iface, (rx_bytes, rx_packets, tx_bytes, tx_packets));
        }

        Ok(map)
    }

    #[cfg(not(target_os = "linux"))]
    {
        Ok(HashMap::new())
    }
}

#[tauri::command]
fn get_vnstat_data(interface: Option<String>) -> Result<serde_json::Value, String> {
    let mut cmd = Command::new("vnstat");
    cmd.arg("--json");
    if let Some(ref iface) = interface {
        if !iface.is_empty() && iface != "all" {
            cmd.args(["-i", iface]);
        }
    }

    let output = cmd.output().map_err(|e| format!("Failed to run vnstat: {}", e))?;
    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        return Err(format!("vnstat returned error: {}", err));
    }

    let stdout_str = String::from_utf8_lossy(&output.stdout);
    let val: serde_json::Value = serde_json::from_str(&stdout_str)
        .map_err(|e| format!("Failed to parse vnstat JSON: {}. Output was: {}", e, stdout_str))?;

    Ok(val)
}

#[tauri::command]
fn get_interfaces() -> Result<Vec<InterfaceSummary>, String> {
    let proc_map = read_proc_net_dev()?;

    // Query vnstat db interfaces
    let db_output = Command::new("vnstat").arg("--dbiflist").output();
    let db_str = db_output
        .map(|o| String::from_utf8_lossy(&o.stdout).to_string())
        .unwrap_or_default();

    let mut list = Vec::new();
    for (iface, (rx, _, tx, _)) in proc_map {
        let in_db = db_str.contains(&iface);
        list.push(InterfaceSummary {
            name: iface,
            is_up: true,
            in_database: in_db,
            rx_bytes: rx,
            tx_bytes: tx,
        });
    }

    if list.is_empty() && !db_str.trim().is_empty() {
        for iface in db_str.split_whitespace() {
            if !iface.is_empty() {
                list.push(InterfaceSummary {
                    name: iface.to_string(),
                    is_up: true,
                    in_database: true,
                    rx_bytes: 0,
                    tx_bytes: 0,
                });
            }
        }
    }

    list.sort_by(|a, b| {
        // Prioritize physical/db interfaces and higher traffic
        b.in_database
            .cmp(&a.in_database)
            .then_with(|| (b.rx_bytes + b.tx_bytes).cmp(&(a.rx_bytes + a.tx_bytes)))
    });

    Ok(list)
}

#[tauri::command]
fn get_95th_percentile(interface: String) -> Result<PercentileReport, String> {
    let output = Command::new("vnstat")
        .args(["--95th", "-i", &interface])
        .output()
        .map_err(|e| format!("Failed to run vnstat --95th: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut report = PercentileReport {
        interface: interface.clone(),
        period_info: String::new(),
        rx_min_str: "0 bit/s".to_string(),
        rx_avg_str: "0 bit/s".to_string(),
        rx_max_str: "0 bit/s".to_string(),
        rx_95th_str: "0 bit/s".to_string(),
        tx_min_str: "0 bit/s".to_string(),
        tx_avg_str: "0 bit/s".to_string(),
        tx_max_str: "0 bit/s".to_string(),
        tx_95th_str: "0 bit/s".to_string(),
        total_min_str: "0 bit/s".to_string(),
        total_avg_str: "0 bit/s".to_string(),
        total_max_str: "0 bit/s".to_string(),
        total_95th_str: "0 bit/s".to_string(),
    };

    for line in stdout.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("20") && trimmed.contains("entries") {
            report.period_info = trimmed.to_string();
        } else if trimmed.starts_with("minimum") {
            let cols: Vec<&str> = trimmed.split('|').collect();
            if cols.len() >= 3 {
                report.rx_min_str = cols[0].replace("minimum", "").trim().to_string();
                report.tx_min_str = cols[1].trim().to_string();
                report.total_min_str = cols[2].trim().to_string();
            }
        } else if trimmed.starts_with("average") {
            let cols: Vec<&str> = trimmed.split('|').collect();
            if cols.len() >= 3 {
                report.rx_avg_str = cols[0].replace("average", "").trim().to_string();
                report.tx_avg_str = cols[1].trim().to_string();
                report.total_avg_str = cols[2].trim().to_string();
            }
        } else if trimmed.starts_with("maximum") {
            let cols: Vec<&str> = trimmed.split('|').collect();
            if cols.len() >= 3 {
                report.rx_max_str = cols[0].replace("maximum", "").trim().to_string();
                report.tx_max_str = cols[1].trim().to_string();
                report.total_max_str = cols[2].trim().to_string();
            }
        } else if trimmed.starts_with("95th %") {
            let cols: Vec<&str> = trimmed.split('|').collect();
            if cols.len() >= 3 {
                report.rx_95th_str = cols[0].replace("95th %", "").trim().to_string();
                report.tx_95th_str = cols[1].trim().to_string();
                report.total_95th_str = cols[2].trim().to_string();
            }
        }
    }

    Ok(report)
}

#[tauri::command]
fn set_interface_alias(interface: String, alias: String) -> Result<String, String> {
    let output = Command::new("vnstat")
        .args(["--setalias", &alias, "-i", &interface])
        .output()
        .map_err(|e| format!("Failed to set alias: {}", e))?;

    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        return Err(format!("vnstat --setalias failed: {}", err));
    }
    Ok(format!("Alias for {} set to '{}'", interface, alias))
}

#[tauri::command]
fn add_interface_to_db(interface: String) -> Result<String, String> {
    let output = Command::new("vnstat")
        .args(["--add", "-i", &interface])
        .output()
        .map_err(|e| format!("Failed to add interface: {}", e))?;

    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        return Err(format!("vnstat --add failed: {}", err));
    }
    Ok(format!("Interface {} added to vnstat database", interface))
}

#[tauri::command]
fn remove_interface_from_db(interface: String) -> Result<String, String> {
    let output = Command::new("vnstat")
        .args(["--remove", "-i", &interface, "--force"])
        .output()
        .map_err(|e| format!("Failed to remove interface: {}", e))?;

    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        return Err(format!("vnstat --remove failed: {}", err));
    }
    Ok(format!("Interface {} removed from vnstat database", interface))
}

#[tauri::command]
fn update_database(interface: Option<String>) -> Result<String, String> {
    let mut cmd = Command::new("vnstat");
    cmd.arg("-u");
    if let Some(iface) = interface {
        cmd.args(["-i", &iface]);
    }
    let output = cmd.output().map_err(|e| format!("Failed to update database: {}", e))?;
    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        return Err(format!("vnstat -u failed: {}", err));
    }
    Ok("Database synchronized successfully".to_string())
}

#[tauri::command]
fn save_export_file(filename: String, contents: String) -> Result<String, String> {
    let mut path = dirs_home().unwrap_or_else(std::env::temp_dir);
    let downloads = path.join("Downloads");
    if downloads.exists() {
        path = downloads;
    }
    let target = path.join(&filename);
    fs::write(&target, contents).map_err(|e| format!("Failed to write export file: {}", e))?;
    Ok(target.to_string_lossy().to_string())
}

fn dirs_home() -> Option<PathBuf> {
    #[cfg(windows)]
    {
        std::env::var_os("USERPROFILE").map(PathBuf::from)
    }
    #[cfg(not(windows))]
    {
        std::env::var_os("HOME").map(PathBuf::from)
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let dev_stats_state: DevStatsMap = Arc::new(Mutex::new(HashMap::new()));
    let bg_state = Arc::clone(&dev_stats_state);

    tauri::Builder::default()
        .setup(move |app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let app_handle = app.handle().clone();

            // Background Tokio 1s live traffic sampler
            tauri::async_runtime::spawn(async move {
                let mut interval = tokio::time::interval(Duration::from_millis(1000));
                loop {
                    interval.tick().await;

                    if let Ok(current_data) = read_proc_net_dev() {
                        let now = Instant::now();
                        let now_epoch_ms = std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap_or_default()
                            .as_millis();

                        let mut rates = Vec::new();
                        let mut prev_guard = bg_state.lock().unwrap();

                        for (iface, (rx_b, rx_p, tx_b, tx_p)) in current_data {
                            if let Some(prev) = prev_guard.get(&iface) {
                                let elapsed = now.duration_since(prev.timestamp).as_secs_f64();
                                if elapsed > 0.0 {
                                    let rx_rate =
                                        ((rx_b.saturating_sub(prev.rx_bytes)) as f64 / elapsed) as u64;
                                    let tx_rate =
                                        ((tx_b.saturating_sub(prev.tx_bytes)) as f64 / elapsed) as u64;
                                    let rx_pps =
                                        ((rx_p.saturating_sub(prev.rx_packets)) as f64 / elapsed) as u64;
                                    let tx_pps =
                                        ((tx_p.saturating_sub(prev.tx_packets)) as f64 / elapsed) as u64;

                                    rates.push(LiveRateSample {
                                        interface: iface.clone(),
                                        timestamp_ms: now_epoch_ms,
                                        rx_bytes_per_sec: rx_rate,
                                        tx_bytes_per_sec: tx_rate,
                                        rx_packets_per_sec: rx_pps,
                                        tx_packets_per_sec: tx_pps,
                                        total_rx_bytes: rx_b,
                                        total_tx_bytes: tx_b,
                                    });
                                }
                            }

                            prev_guard.insert(
                                iface,
                                NetDevSnapshot {
                                    timestamp: now,
                                    rx_bytes: rx_b,
                                    rx_packets: rx_p,
                                    tx_bytes: tx_b,
                                    tx_packets: tx_p,
                                },
                            );
                        }

                        if !rates.is_empty() {
                            let _ = app_handle.emit("live-traffic-tick", rates);
                        }
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_vnstat_data,
            get_interfaces,
            get_95th_percentile,
            set_interface_alias,
            add_interface_to_db,
            remove_interface_from_db,
            update_database,
            save_export_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
