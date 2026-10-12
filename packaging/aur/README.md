# Arch User Repository (AUR) Publishing Guide for NetPulse

This directory contains the packaging recipes for submitting **NetPulse** to the Arch User Repository (AUR).

## Packages Provided

1. **`netpulse-bin`** (Recommended): Binary repack of the official release `.deb` archive from GitHub Releases. Installs instantaneously on end-user machines without compiling Rust/WebKitGTK dependencies.
2. **`netpulse`**: Source package that builds the Tauri binary from the GitHub source tarball using `bun` and `cargo`.

---

## 🚀 How to Publish to AUR

### Step 1: Set Up Your AUR Account & SSH Key
If you haven't already:
1. Register at [aur.archlinux.org](https://aur.archlinux.org/).
2. Add your public SSH key (`~/.ssh/id_ed25519.pub`) in your AUR Account Settings.

### Step 2: Clone the AUR Repository
Clone the AUR Git endpoints for the package:

```bash
git clone ssh://aur@aur.archlinux.org/netpulse-bin.git
# or
git clone ssh://aur@aur.archlinux.org/netpulse.git
```

### Step 3: Copy PKGBUILD & Update Checksums
After a new release is cut on GitHub (e.g. `v0.1.0`):

```bash
cd netpulse-bin
cp /path/to/DEV/VNstat/packaging/aur/netpulse-bin/PKGBUILD .

# Automatically download release asset and calculate sha256 checksum
updpkgsums

# Regenerate .SRCINFO
makepkg --printsrcinfo > .SRCINFO

# Test the build locally
makepkg -si
```

### Step 4: Commit and Push to AUR
```bash
git add PKGBUILD .SRCINFO
git commit -m "chore(release): update to 0.1.0"
git push origin master
```

---

## 📦 How Users Install from AUR

Once pushed to AUR, any Arch Linux, CachyOS, EndeavourOS, or Manjaro user can install NetPulse with their preferred AUR helper:

```bash
yay -S netpulse-bin
# or
paru -S netpulse-bin
```
