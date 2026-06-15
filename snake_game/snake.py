# snake.py
import pygame
from settings import BLOCK_SIZE, GREEN

class Snake:
    def __init__(self, x, y):
        # Body is a list of coordinates (x, y)
        self.body = [(x, y), (x - BLOCK_SIZE, y), (x - 2 * BLOCK_SIZE, y)]
        self.direction = "RIGHT"
        self.next_direction = "RIGHT"
        self.grow = False

    def handle_event(self, event):
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_UP and self.direction != "DOWN":
                self.next_direction = "UP"
            elif event.key == pygame.K_DOWN and self.direction != "UP":
                self.next_direction = "DOWN"
            elif event.key == pygame.K_LEFT and self.direction != "RIGHT":
                self.next_direction = "LEFT"
            elif event.key == pygame.K_RIGHT and self.direction != "LEFT":
                self.next_direction = "RIGHT"

    def update(self):
        self.direction = self.next_direction
        head_x, head_y = self.body[0]

        if self.direction == "UP":
            head_y -= BLOCK_SIZE
        elif self.direction == "DOWN":
            head_y += BLOCK_SIZE
        elif self.direction == "LEFT":
            head_x -= BLOCK_SIZE
        elif self.direction == "RIGHT":
            head_x += BLOCK_SIZE

        self.body.insert(0, (head_x, head_y))
        
        if not self.grow:
            self.body.pop()
        else:
            self.grow = False

    def draw(self, screen):
        for segment in self.body:
            rect = pygame.Rect(segment[0], segment[1], BLOCK_SIZE, BLOCK_SIZE)
            pygame.draw.rect(screen, GREEN, rect)
