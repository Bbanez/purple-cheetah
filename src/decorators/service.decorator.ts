export function Service(objectClass: any) {
  return (target: any, name: string | symbol) => {
    target[name] = new objectClass();
  };
}
