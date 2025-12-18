# MP3 Files Folder

Place your MP3 preview files here. The files should be named to match the `previewUrl` paths in `data/mixes.json`.

## Expected Files

Based on the current `mixes.json` configuration, add the following files:

- `istanbul-nights-vol1.mp3`
- `bosphorus-sunset-session.mp3`
- `midnight-express.mp3`
- `euphoria.mp3`
- `deep-connection.mp3`
- `summer-terrace-mix.mp3`
- `warehouse-sessions.mp3`
- `afterhours-meditation.mp3`
- `festival-anthem-mix.mp3`

## Notes

- Keep preview clips short (20-30 seconds) for quick loading
- Recommended format: MP3, 128-192 kbps
- Each file corresponds to a mix entry in `data/mixes.json`

## Updating Paths

To add or change MP3 files:
1. Add your MP3 file to this folder
2. Update the `previewUrl` in `data/mixes.json` to match: `"./mp3/your-file-name.mp3"`
