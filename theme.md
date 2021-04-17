<!-- theme.css -->

.region-selector
{
  top:0;
  left:0;
  z-index:2000;
  position:fixed;
  width:100%;
  height:100vh;
  background-color:rgba(0,0,0,0.75);
}

.region-selector .content 
{
  position:absolute;
  bottom:0;
  left:50%;
  transform:translateX(-50%);
  width: 400px;
  border-radius: 5px 5px 0 0;
  background-color:white;
  padding: 20px 25px;
  text-align:center;
  padding-top:62px;
  box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
}

.region-selector .flag
{
  position:absolute;
  top:0;
  left:50%;
  transform:translateX(-50%) translateY(-50%);
  width:120px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
}

.region-selector .main
{
  font-size:1.30em;
  font-weight:bold;
  display:block;
  text-transform:uppercase;
  color:black;
  margin-bottom:5px;
}

.region-selector .sub
{
	display:block;
}

.region-selector .description 
{
	margin-top:15px;
}

.region-selector button
{
  display:block;
  width:100%;
}

.region-selector .change-region
{
  display:block;
  margin-top:20px;
  margin-bottom:10px;
}

<!-- theme.liquid -->

<div class="region-selector">
  <div class="content">
    <img src="https://www.beautybay.com/assets/core/images/flags/lk.png" class="flag" />
    <span class="main">We are shipping to Sri Lanka</span>
    <span class="sub">Prices are shown and changed to <strong>USD</strong>.</span>
    
    <p class="description">We use <a href="#">cookies</a> to ensure you have the best experience.</p>
    
    <button class="btn" id="regionContinueShoppingBtn">Continue Shopping</button>
    
    <a href="#" class="change-region">Not shipping to Sri Lanka?</a>
  </div>
</div>

<!-- theme.js -->