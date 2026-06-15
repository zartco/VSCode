# Snake Game

This is a small Pygame implementation of the classic Snake loop. It is useful as a compact practice project because the rules are visible, the state changes are easy to trace, and mistakes show up immediately on screen.

## Learning Context

- **Course / concept:** CS50p-style Python fundamentals and game-loop state management.
- **What it demonstrates:** Classes, event handling, collision detection, grid-based movement, score tracking, and separating settings from game objects.
- **Portfolio role:** A readable arcade-game exercise that shows how simple objects collaborate in a loop.

## Code Map

- `main.py` initializes Pygame, opens the window, and runs the frame loop.
- `game.py` owns score, reset behavior, food collision, wall collision, and game-over handling.
- `snake.py` stores the snake body and translates arrow-key events into movement.
- `food.py` randomizes food positions on the grid.
- `settings.py` keeps screen size, speed, block size, and colors in one place.

## Run It

```bash
python -m pip install -r requirements.txt
python main.py
```

Controls:

- Arrow keys move the snake.
- After game over, press `C` to restart or `Q` to quit.

## Known Limitations

- Food is randomized without a seed, so runs are not deterministic.
- There is no automated test suite yet; collision and restart behavior are verified by playing.
- The game assumes a graphical desktop environment where Pygame can open a window.
