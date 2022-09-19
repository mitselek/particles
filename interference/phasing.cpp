#include <string>
#include <iostream>
using namespace std;
 
#define C              299792458 // speed limit in m/s
#define P2M            1 // how many meters per point
#define P_SIZE         0
#define NUM_ANTENNAS   5
#define FREQUENCY      142800000
#define WAVELENGTH     C / FREQUENCY
#define WAVELENGTH_PT  WAVELENGTH / P2M


class AntennaArray {
    public:
        int x, y;
        float r;

}



class MyClass {       // The class
  public:             // Access specifier
    int myNum;        // Attribute (int variable)
    string myString;  // Attribute (string variable)
};

int main() {
  MyClass myObj;  // Create an object of MyClass

  // Access attributes and set values
  myObj.myNum = 15; 
  myObj.myString = "Some text";

  // Print attribute values
  cout << myObj.myNum << "\n";
  cout << myObj.myString;
  return 0;
}