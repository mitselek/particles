#include <GL/gl.h>
#include <GL/glut.h>
#include <math.h>

int frameNumber = 0;

void drawWindmill()
{
    int i;
    glColor3f(0.9f, 0.9f, 0.9f);

    glBegin(GL_POLYGON);
    glVertex2f(-0.05f, 0);
    glVertex2f(0.05f, 0);
    glVertex2f(0.05f, 3);
    glVertex2f(-0.05f, 3);
    glEnd();
    glTranslatef(0, 3, 0);
    glRotated(frameNumber * (180.0/46), 0, 0, 1);

    glColor3f(1.0f, 1.0f, 1.0f);

    for (i = 0; i < 3; i++)
    {
        glRotated(120, 0, 0, 1);
        glBegin(GL_POLYGON);
        glVertex2f(0,0);
        glVertex2f(0.5f, 0.1f);
        glVertex2f(1.5f,0);
        glVertex2f(0.5f, -0.1f);
        glEnd();
    }
}


void display()
{

    glClear(GL_COLOR_BUFFER_BIT);

    glColor3f(0, 0.6f, 0.2f);
    glBegin(GL_POLYGON);
    glVertex2f(-3,-1);
    glVertex2f(1.5f,1.65f);
    glVertex2f(5,-1);
    glEnd();

    glBegin(GL_POLYGON);
    glVertex2f(-3,-1);
    glVertex2f(3,2.1f);
    glVertex2f(7,-1);
    glEnd();

    glBegin(GL_POLYGON);
    glVertex2f(0,-1);
    glVertex2f(6,1.2f);
    glVertex2f(20,-1);
    glEnd();


    glPushMatrix();
    glTranslated(1.25,1,0);
    glScaled(0.6,0.6,1);
    drawWindmill();
    glPopMatrix();

    glPushMatrix();
    glTranslated(2.7,1.6,0);
    glScaled(0.4,0.4,1);
    drawWindmill();
    glPopMatrix();

    glPushMatrix();
    glTranslated(4.2,0.8,0);
    glScaled(0.7,0.7,1);
    drawWindmill();
    glPopMatrix();

    glutSwapBuffers();

}


void doFrame(int v)
{
    frameNumber++;
    glutPostRedisplay();
    glutTimerFunc(30,doFrame,0);
}


void init()
{
    glClearColor(0.5f, .8f, 1.0f,1);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    glOrtho(0, 7, -1, 4, -1, 1);
    glMatrixMode(GL_MODELVIEW);
}


int main(int argc, char** argv)
{
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE);
    glutInitWindowSize(800,500);
    glutInitWindowPosition(100,100);
    glutCreateWindow("Windmill Animation");
    init();
    glutDisplayFunc(display);
    glutTimerFunc(200,doFrame,0);
    glutMainLoop();
    return 0;
}
