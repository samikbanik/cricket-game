# Cricket Mini-Game Sound Effects TODO

## Sound Engine
- [ ] Create Web Audio API sound engine with AudioContext management
- [ ] Synthesize bat-on-ball crack sound (sharp attack, short decay)
- [ ] Synthesize crowd cheer (noise burst with bandpass filter, long sustain)
- [ ] Synthesize wicket fall (low thud + stumps rattle)
- [ ] Synthesize bowling delivery whoosh
- [ ] Synthesize dot ball (soft thud)
- [ ] Synthesize boundary four (medium cheer)
- [ ] Synthesize six (big cheer + firework pop)
- [ ] Synthesize single/double run (quick tap)
- [ ] Synthesize UI click sounds for shot selection
- [ ] Synthesize game over fanfare

## Integration
- [ ] Hook sounds into game phase transitions in useGameLoop or PlayGame
- [ ] Play bowling whoosh on bowling phase
- [ ] Play bat crack on timing lock
- [ ] Play result-specific sound on outcome reveal
- [ ] Play game over sound

## UI
- [ ] Add mute/volume toggle button to game header
- [ ] Persist mute preference in localStorage
- [ ] Test full gameplay loop with sounds
