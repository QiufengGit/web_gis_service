import { Viewer } from "cesium";

declare global
{
    interface Window 
    {
      CesiumViewer: Viewer; 
    }
}