/* 08-11-2014 */
/* billy */
/* mandelbrot_glut.c */
#include <stdio.h>
#include <stdlib.h>
#include <GL/glut.h>
#include <GL/gl.h>
#include <GL/glu.h>
#include <math.h>

int vec_iter[8] = {10, 20, 50, 100, 500, 1000, 5000, 15000}; 
int amp = 800, alt = 533, iter_ind = 4, color = 0;
double min_re = -2.0, max_re = 1.0, min_im = -1.0, max_im = 1.0;
double qua_x, qua_y; 

void veure();
void ratoli(int, int, int, int);
void teclat(unsigned char, int, int);
void fletxes(int, int, int);
void canviarTamany(int, int);

int main (int num_arg, char * vec_arg[]) {
  glutInit(&num_arg, vec_arg);
  glutInitDisplayMode(GLUT_RGBA);
  glutInitWindowSize(amp, alt);
  glutCreateWindow("Mandelbrot");
  glutDisplayFunc(veure);
  glutKeyboardFunc(teclat);
  glutSpecialFunc(fletxes);
  glutMouseFunc(ratoli);
  /* glutReshapeFunc(canviarTamany); */
  glutMainLoop();
  return 0;
}

void veure() {
  GLdouble p[2];
  double tam_re = max_re - min_re;
  double tam_im = max_im - min_im;
  double dif = tam_re / amp;
  double c_re = 0.0, c_im = 0.0, z_re = 0.0, z_im = 0.0, real = 0.0, imag = 0.0, modul = 0.0, norm = 0.0;
  int resolucio_y = (int) ((tam_im / tam_re) * amp);
  int i, j, k, mandel;

  glClear(GL_COLOR_BUFFER_BIT);

  for (i = 0; i < amp; i++) {
    for (j = 0; j < resolucio_y; j++) {
      p[0] = (GLdouble) (-1.0 + ((2.0 / amp) * i));
      p[1] = (GLdouble) (-1.0 + ((2.0 / resolucio_y) * j));
      mandel = 0;
      c_re = min_re + (dif * i);
      c_im = min_im + (dif * j);
      z_re = z_im = 0.0;
      k = 0;
      while ((k < vec_iter[iter_ind]) && (mandel == 0)) {
	real = (z_re * z_re) - (z_im * z_im);
	imag = (z_re * z_im) + (z_im * z_re);
	z_re = real + c_re;
	z_im = imag + c_im;
	modul = sqrt((z_re * z_re) + (z_im * z_im));
	if (modul > 2.0)
	  mandel = 1;
	k++;
      }
      glBegin(GL_POINTS);
      if (mandel == 0)
	glColor3f(0.0f, 0.0f, 0.0f);
      else {
	if (color == 0) {
	  norm = sqrt(0.261027 * (k - log(log(modul))) / 0.6931471805599453);
	  glColor3f(0.5 * (1 + sin(norm - 8.5)), 0.5 * (1 + sin(norm - 7.9)), 0.5 * (1 + sin(norm - 7.2)));
	}
	else
	  glColor3f(1.0f, 1.0f, 1.0f);
      }
      glVertex2dv(p);
      glEnd();
    }
  }
  glFlush();
  glFinish();
}

void ratoli(int boto, int estat, int x, int y) {
  double tam_re = max_re - min_re;
  double tam_im = max_im - min_im;
  double real = ((tam_re / amp) * x) + min_re;
  double imag = max_im - ((tam_im / alt) * y);

  if (boto == GLUT_LEFT_BUTTON) {
    if (estat == GLUT_DOWN) {
      qua_x = real;
      qua_y = imag;
    }
    else if (estat == GLUT_UP) {
      min_im = qua_y - ((tam_im / tam_re) * (real - qua_x));
      min_re = qua_x;
      max_im = qua_y;
      max_re = real;
      #ifdef DEBUG
      printf("[DEPURACIO] Minim = (%.18f + (%.18f)i), Maxim = (%.18f, (%.18f)i)\n", min_re, min_im, max_re, max_im);
      #endif
    }
  }
  veure();
}

void teclat(unsigned char tecla, int x, int y) {
  (void)(x);
  (void)(y);
  if (tecla == '+') {
    if (iter_ind < 7)
      iter_ind++;
    printf("Iteracions: %d\n", vec_iter[iter_ind]);
  }
  else if (tecla == '-') {
    if (iter_ind > 0)
      iter_ind--;
    printf("Iteracions: %d\n", vec_iter[iter_ind]);
  }
  else if (tecla == 'r') {
    printf("Reiniciant...\n");
    min_re = -2.0;
    max_re = 1.0;
    min_im = -1.0;
    max_im = 1.0;
  }
  else if (tecla == 'c')
    color = !color;
  veure();
}

void fletxes(int tecla, int x, int y) {
  (void)(x);
  (void)(y);
  double tam_re = max_re - min_re;
  double tam_im = max_im - min_im;
  double desp;
  if (tecla == GLUT_KEY_UP) {
    desp = tam_im * 0.2;
    max_im += desp;
    min_im += desp;
  }
  else if (tecla == GLUT_KEY_DOWN) {
    desp = tam_im * 0.2;
    max_im -= desp;
    min_im -= desp;
  }
  else if (tecla == GLUT_KEY_RIGHT) {
    desp = tam_re * 0.2;
    max_re += desp;
    min_re += desp;
  }
  else if (tecla == GLUT_KEY_LEFT) {
    desp = tam_re * 0.2;
    max_re -= desp;
    min_re -= desp;
  }
  veure();
}

void canviarTamany(int ample, int altura) {
  /* funciona mal perque si augmentem poc a poc el tamany de la finestra va fent tots els calculs de les resolucions intermitjes */
  amp = ample;
  alt = altura;
  glViewport(0, 0, amp, alt);
  veure();
}