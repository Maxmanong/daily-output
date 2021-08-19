const Info = ({
  match:{
    params: { routeParam }
  }
}) => {
  return (
    <div>
      Info页面：{ routeParam }
    </div>
  )
}

export default Info