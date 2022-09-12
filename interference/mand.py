from time import sleep
from pygame.locals import *
import pygame

SPEED_OF_LIGHT = 299792458 # speed limit in m/s
SCALE = 1 # how many meters per point
NUM_ANTENNAS = 5
FREQUENCY = 142800000
WAVELENGTH = SPEED_OF_LIGHT / FREQUENCY # in meters
WAVELENGTH_PT = WAVELENGTH / SCALE # in points on screen


TARGET = {'x': 400, 'y': 100, 'r':20}

class Antenna:
    def __init__(self, x, y, amplitude = 1, frequency = FREQUENCY, phase_shift = 0, color = (255,255,255)) -> None:
        self.name = ''
        self.x = x
        self.y = y
        self.amplitude = amplitude
        self.frequency = frequency
        self.phase_shift = phase_shift
        self.color = color

class AntennaArray:
    def __init__(self, x, y) -> None:
        self.x = x
        self.y = y
        self.r = WAVELENGTH_PT * 0.5
        self.antennas = []

    def addAntenna(self, x, y, amplitude = 1, frequency = FREQUENCY, phase_shift = 0, color = (255,255,255)):
        antenna = Antenna(x, y, amplitude, frequency, phase_shift, color)
        self.antennas.append(antenna)
        return antenna

def main():
    width, height = 1024, 1024
    screen = pygame.display.set_mode((width,height), DOUBLEBUF)

    antenna_array = AntennaArray(400, 500)
    for ax in range(NUM_ANTENNAS):
        x = antenna_array.x
        y = antenna_array.y + (ax/(NUM_ANTENNAS-1) - 0.5) * 2 * antenna_array.r
        antenna_array.addAntenna(x, y).name = ax

    xaxis = width/1.5+140
    yaxis = height/2
    scale = 600
    iterations = 50


    for blue in range(256):
        for iy in range(height):
            for ix in range(width):
                color = (ix%256,iy%256,blue)
                screen.set_at((ix, iy), color)
                pass
        pygame.display.update()
        print (blue)

    while True:
        event = pygame.event.poll()
        if (event.type == QUIT or
            (event.type == KEYDOWN and event.key == K_ESCAPE)):
            break

if __name__ == "__main__":
    main()