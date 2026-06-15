# game.py
import pygame
from settings import WIDTH, HEIGHT, BLOCK_SIZE, BLUE, WHITE
from snake import Snake
from food import Food

class Game:
    def __init__(self, screen):
        self.screen = screen
        self.font = pygame.font.SysFont(None, 35)
        self.reset()

    def reset(self):
        self.snake = Snake(WIDTH // 2, HEIGHT // 2)
        self.food = Food()
        self.score = 0
        self.game_over = False

    def handle_event(self, event):
        if self.game_over:
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_c:
                    self.reset()
                elif event.key == pygame.K_q:
                    pygame.event.post(pygame.event.Event(pygame.QUIT))
            return
            
        self.snake.handle_event(event)

    def update(self):
        if self.game_over:
            return

        self.snake.update()
        
        head = self.snake.body[0]

        # Check collision with wall
        if head[0] < 0 or head[0] >= WIDTH or head[1] < 0 or head[1] >= HEIGHT:
            self.game_over = True
            
        # Check collision with self
        if head in self.snake.body[1:]:
            self.game_over = True

        # Check collision with food
        if head == self.food.position:
            self.snake.grow = True
            self.score += 10
            # Ensure food doesn't spawn on snake
            while self.food.position in self.snake.body:
                self.food.randomize_position()

    def draw(self, screen):
        self.food.draw(screen)
        self.snake.draw(screen)
        
        # Draw score
        score_text = self.font.render(f"Score: {self.score}", True, BLUE)
        screen.blit(score_text, [10, 10])

        if self.game_over:
            msg = self.font.render("Game Over! Press C to Play Again or Q to Quit", True, WHITE)
            screen.blit(msg, [WIDTH // 6, HEIGHT // 3])
