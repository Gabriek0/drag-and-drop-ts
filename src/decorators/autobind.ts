namespace App {
  // Decorators
  // method decorators use three parameters, target, methodName, and descriptor.
  export function AutoBind(_: any, __: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjustedPropertyDescriptor: PropertyDescriptor = {
      configurable: true,
      get() {
        const bindFunction = originalMethod.bind(this);

        return bindFunction;
      },
    };

    return adjustedPropertyDescriptor;
  }
}
