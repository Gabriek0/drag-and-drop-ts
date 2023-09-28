namespace App {
  // This interface will be to ProjectItem class
  export type Draggable = {
    dragStartHandler: (event: DragEvent) => void;
    dragEndHandler: (event: DragEvent) => void;
  };

  // This interface will be to ProjectList Class
  /**
   *
   * @param dropHandler The element was dropped
   * @param dropOverHandler The element is being dragged
   * @param dropLeaveHandler The visual feedback to user, if element is draggable into the blocked area
   */
  export type DragTarget = {
    dropHandler: (event: DragEvent) => void;
    dragOverHandler: (event: DragEvent) => void;
    dragLeaveHandler: (event: DragEvent) => void;
  };
}
