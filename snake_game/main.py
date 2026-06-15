# main.py
import pygame
import sys
from settings import WIDTH, HEIGHT, FPS, BLACK
from game import Game

def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("Snake Game")
    clock = pygame.time.Clock()

    game = Game(screen)

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            
            game.handle_event(event)

        game.update()
        
        screen.fill(BLACK)
        game.draw(screen)
        pygame.display.flip()
        
        clock.tick(FPS)

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()
