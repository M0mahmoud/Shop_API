const deleteProduct = (btn) => {
  console.log("Clicked...", btn);
  const productId = btn.parentNode.querySelector("[name=productId]").value;
  // Add Csrf Token

  const productWillDeleted = btn.closest("article");

  console.log("productWillDeleted:", productWillDeleted);

  fetch(`/admin/product/${productId}`, {
    method: "DELETE",
    headers: {
      // 'csrf-token': csrf
    },
  })
    .then((res) => {
      console.log(res);
      return res.json();
    })
    .then((data) => {
      console.log(data);
      productWillDeleted.parentNode.removeChild(productWillDeleted);
    })
    .catch((err) => {
      console.log(err);
      return err.json();
    });
};
