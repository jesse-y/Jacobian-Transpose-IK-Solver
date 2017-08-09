# Jacobian-Transpose-IK-Solver
An inverse kinematics solver using the Jacobian Transpose matrix with Denavit-Hartenberg representation for the kinematic chain.

## Requirements
The project uses Three.js and will require a browser with HTML5 support with a WebGL renderer.

## Interacting with the Demonstration
A red opaque cylinder represents the desired target, and attached to it is a transform controller. Press W to translate, E to rotate, and Q to switch between world and local coordinate space. Press and hold Ctrl to snap the controller to the grid.

The project uses Autodesk Maya style camera controls. Press and hold Alt to activate camera controls. Alt+LMB to orbit, Alt+MMB to pan, Alt+RMB to dolly and use the scroll wheel to zoom in and out.

The state of the robot arm is displayed in the bottom left corner.

## Usage
Creating the Kinematic Chain, and iterating towards the target:
```javascript
//The KinematicChain takes a 2D array, where each entry represents a 
//joint as an array of length 4 - these are the denavit hartenberg (DH) 
//parameters that describe how each joint chain is constrained to the joint 
//before it. The DH parameters are in this order: [d, a, alpha, theta]. 
//This example contains a 6DOF robot arm.

var chain = new KinematicChain([
   [5, 0, -90, 0],
   [0, 2, 90, 125],
   [0, 15, 0, -35],
   [15, 2, 90, 0],
   [0, 0, -90, 90],
   [2, 0, -90, 0]
	]);

//Call .interateIK(target) to move the target one iteration towards 
//the provided target. The function takes an array of length X where 
//X is the number of parameters that describe how the object exists in 
//its workspace. The target array is interpreted as a vector that represents 
//the movement from the end effector (Tool/Joint end of the kinematic chain) 
//to the target. In this example, we are defining 6DOF, where the first 3 values 
//represent XYZ positions, and the remaining three represent XYZ euler angles.

var target = [
  x2-x1,
  y2-y1,
  z2-z1,
  rotX2-rotX1,
  rotY2-rotY1,
  rotZ2-rotZ1
];

chain.iterateIK(target);
  
```

## Denavit-Hartenberg parameters
Denavit-Hartenberg parameters are a popular convention when describing the relationship between joints. The kinematic chain is considered as a set of joints j rigidly connected by links j-1. Each joint has attached to it four parameters d, a, alpha, and theta which describe the two screw displacements along the Z axis and X axis from the current joint to the next joint in the chain. 

The Z screw displacement is described by some rotation theta about the Z axis of the current joint, and some distance d along that axis. Similarly, the X screw displacement descibes a rotation alpha about the X axis, moved some distance a out to the next joint. Note the X axis is the common normal between the z axis of the current joint to the z axis of the next joint.

To calculate the position of the end effector, a 4D transformation matrix is computed for each joint, wherein the matrix transform of d, a, alpha, and theta are multiplied together in the following order: alpha * a * theta * d. There are variations of the order depending upon which particular style you choose, and they depend on whether you are describing the relation between the joint and its child, or the joint and its parent. Once the DH transform matrix is computed, calculating the transform of the end effector is as simple as multiplying the matrix of each joint together, from the base to the tip.

## Jacobian Transpose
The Jacobian matrix describes how each parameter (x, y, z, xRot, yRot, zRot in a 6DOF system) in each joint affects the parameters in the end effector. It is an m * n matrix where m = degrees of freedom and n = number of joints. Thus, for a 6DOF robotic arm, the jacobian matrix J is a 6 * 6 matrix.

To calculate the jacobian, we need to determine how each each of the 6 parameters in the joint affect the position and orientation of the end effector. Given a revolute joint that can only rotate along its z axis, the entry for the ith joint in the chain is given by: 

```javascript
transpose([Zi x (Pe - Pi), Zi])
```
where Zi is the normalized axis of rotation for the current joint in world space, and Pe is the point of the end effector in world space, and Pi is the point of the ith joint in world space. In regular parlance, the positional relationship between the joint i and the end effector e is given by the cross product of the vector (e-i) with the normalized axis of rotation for that joint, and the orientation relationship between the joint and end effector is given by the normalized axis of rotation for the current joint.

Currently, the Jacobian in its current form describes how the end effector moves with respect to each joint. In order to use it to solve the inverse kinematics problem, we need to find the inverse of this matrix. The simplest and generally computationally inexpensive solution is to take the transpose of this matrix and dot product it with a vector describing the difference between the end effector and the desired target. One other means to determine the inverse of the Jacobian is the pseudo-inverse.

Once we have inverted the Jacobian (or something approximate), we can determine the change, delta-theta, required for each joint to move the end effector incrementally towards the target by taking the dot product of the vector difference between the end effector and the target with the Jacobian inverse. The result is a vector where the ith entry is the delta-theta for the ith joint. Note that the resulting vector needs to be scaled by some factor alpha, to ensure that the change is only incremental and won't cause wild oscillation while the kinematic chain attempts to move towards the target.

## Notes

In the current implementation, the kinematic chain generally reaches the target's positional requirement smoothly and rapidly. However, the rotational component generally takes considerably longer to converge, and difficult rotations can cause the chain to become unstable. The scaling factor alpha was set to alpha = 0.05, and was determined empirically.
