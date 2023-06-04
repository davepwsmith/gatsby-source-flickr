import { IGatsbyImageData } from "gatsby-plugin-image";
import { getGatsbyImageResolver } from "gatsby-plugin-image/graphql-utils"

const generateSrcSets = (imageUrls, width: number, height: number) => {

  let widths = imageUrls.map(x => x.width)
  let heights = imageUrls.map(x => x.height)
  let maxWidth = width ? Math.min(...widths.filter( num => num >= width )) : Math.max(...widths)
  let maxHeight = height ? Math.min(...heights.filter( num => num >= height )) : Math.max(...heights)

  console.log(height)
  console.log(heights)
  console.log(maxHeight)
  
  let images = imageUrls.filter(x => x.width > 150 && x.width <= maxWidth)

  const srcSet = images.map(x=> `${x.url} ${x.width}w`).join()
  const maxWidthSettings = images.map(x => `(max-width: ${Math.ceil(x.width/100)*100}px) ${x.width}px`).join()
  const sizes = `${maxWidthSettings}, ${maxWidth}px`

  return {
    srcSet: srcSet,
    sizes: sizes,
    type: 'image/jpg'
  }
  
  }


  const resolveGatsbyImageData = async (image, options) => {
    // The `image` argument is the node to which you are attaching the resolver,
    // so the values will depend on your data type.
 
  //  const sourceMetadata: IGatsbyImageHelperArgs['sourceMetadata'] = {
  //    width: image.width,
  //    height: image.height,
  //    format: "jpg"
  //  }
  //  console.log(image)
   const { width, height } = options
   const sources = generateSrcSets(image.imageUrls, width, height)
   

   const imageData: IGatsbyImageData = {
      layout: 'constrained',
      width: width,
      height: height,
      images: {
        sources: [
          sources
        ]
      }

   } 
 
   // Generating placeholders is optional, but recommended
  //  if(options.placeholder === "blurred") {
  //    // This function returns the URL for a 20px-wide image, to use as a blurred placeholder
  //    // You need to download the image and convert it to a base64-encoded data URI
  //    const lowResImage = getLowResolutionImageURL(imageDataArgs)
 
  //    // This would be your own function to download and generate a low-resolution placeholder
  //    console.log(lowResImage)
  //    imageDataArgs.placeholderURL =  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII="
  //  }
 
   // You could also calculate dominant color, and pass that as `backgroundColor`
   // gatsby-plugin-sharp includes helpers that you can use, such as calculating
   // the dominant color of a local file, if you don't want to handle it in your plugin
 
 
   return imageData
 }

 export const createResolvers = ({ createResolvers }) => {
    createResolvers({
      FlickrPhoto: {
        // loadImageData is your custom resolver, defined in step 2
        gatsbyImageData: getGatsbyImageResolver(resolveGatsbyImageData),
      },
    })
  }