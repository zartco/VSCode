# food.py
import pygame
import random
from settings import BLOCK_SIZE, RED, WIDTH, HEIGHT

class Food:
    def __init__(self):
        self.position = (0, 0)
        self.randomize_position()

    def randomize_position(self):
        x = random.randrange(0, WIDTH, BLOCK_SIZE)
        y = random.randrange(0, HEIGHT, BLOCK_SIZE)
        self.position = (x, y)

    def draw(self, screen):
        rect = pygame.Rect(self.position[0], self.position[1], BLOCK_SIZE, BLOCK_SIZE)
        pygame.draw.rect(screen, RED, rect)
