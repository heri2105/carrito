import React,{useState, useEffect} from 'react'
import {Navbar} from './Navbar'
import {auth,fs} from '../Config/Config'
import { CartProducts } from './CartProducts';
import StripeCheckout from 'react-stripe-checkout';
import axios from 'axios';
import {useHistory} from 'react-router-dom'

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal } from './Modal';

toast.configure();

export const Cart = () => { 
    const [showModal, setShowModal]=useState(false);
    const triggerModal=()=>{
        setShowModal(true);
    }
    const hideModal=()=>{
        setShowModal(false);
    }
    function GetCurrentUser(){
        const [user, setUser]=useState(null);
        useEffect(()=>{
            auth.onAuthStateChanged(user=>{
                if(user){
                    fs.collection('users').doc(user.uid).get().then(snapshot=>{
                        setUser(snapshot.data().FullName);
                    })
                }
                else{
                    setUser(null);
                }
            })
        },[])
        return user;
    }

    const user = GetCurrentUser();
    const [cartProducts, setCartProducts]=useState([]);
    useEffect(()=>{
        auth.onAuthStateChanged(user=>{
            if(user){
                fs.collection('Cart ' + user.uid).onSnapshot(snapshot=>{
                    const newCartProduct = snapshot.docs.map((doc)=>({
                        ID: doc.id,
                        ...doc.data(),
                    }));
                    setCartProducts(newCartProduct);                    
                })
            }
            else{
            }
        })
    },[])
    const qty = cartProducts.map(cartProduct=>{
        return cartProduct.qty;
    })
    const reducerOfQty = (accumulator, currentValue)=>accumulator+currentValue;
    const totalQty = qty.reduce(reducerOfQty,0);
    const price = cartProducts.map((cartProduct)=>{
        return cartProduct.TotalProductPrice;
    })
    const reducerOfPrice = (accumulator,currentValue)=>accumulator+currentValue;
    const totalPrice = price.reduce(reducerOfPrice,0);
    let Product;
    const cartProductIncrease=(cartProduct)=>{
        Product=cartProduct;
        Product.qty=Product.qty+1;
        Product.TotalProductPrice=Product.qty*Product.price;
        auth.onAuthStateChanged(user=>{
            if(user){
                fs.collection('Cart ' + user.uid).doc(cartProduct.ID).update(Product).then(()=>{
                    console.log('increment added');
                })
            }
            else{
            }
        })
    }
    const cartProductDecrease =(cartProduct)=>{
        Product=cartProduct;
        if(Product.qty > 1){
            Product.qty=Product.qty-1;
            Product.TotalProductPrice=Product.qty*Product.price;
             // updating in database
            auth.onAuthStateChanged(user=>{
                if(user){
                    fs.collection('Cart ' + user.uid).doc(cartProduct.ID).update(Product).then(()=>{
                        console.log('decrement');
                    })
                }
                else{
                }
            })
        }
    }

     // state of totalProducts
     const [totalProducts, setTotalProducts]=useState(0);
     // getting cart products   
     useEffect(()=>{        
         auth.onAuthStateChanged(user=>{
             if(user){
                 fs.collection('Cart ' + user.uid).onSnapshot(snapshot=>{
                     const qty = snapshot.docs.length;
                     setTotalProducts(qty);
                 })
             }
         })       
     },[])
     
     // charging payment
     const history = useHistory();
     const handleToken = async(token)=>{
            history.push('/');
            toast.success('Tu pedido ha sido realizado con éxito', {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                progress: undefined,
              });
              
              const uid = auth.currentUser.uid;
              const carts = await fs.collection('Cart ' + uid).get();
              for(var snap of carts.docs){
                  fs.collection('Cart ' + uid).doc(snap.id).delete();
              }
     }
   
    return (
        <>
            <Navbar user={user} totalProducts={totalProducts} />           
            <br></br>
            {cartProducts.length > 0 && (
                <div className='container-fluid'>
                    <h1 className='text-center'>Cart</h1>
                    <div className='products-box cart'>
                        <CartProducts cartProducts={cartProducts}
                           cartProductIncrease={cartProductIncrease}
                           cartProductDecrease={cartProductDecrease}
                        />
                    </div>
                    <div className='summary-box'>
                        <h5>Detalle del pedido</h5>
                        <br></br>
                        <div>
                        Total de productos <span>{totalQty}</span>
                        </div>
                        <div>
                        Total a pagar: <span>$ {totalPrice}</span>
                        </div>
                        <br></br>
                        <StripeCheckout
                            stripeKey='pk_test_51Hhu6bK4kL4WRmvGEUkTmdFw1lUtTAnadBSDb0eXGuA2JJGrntIBdm10llYu5RbPbLbaS1My74Rgdi0n5ePYIGB600p3V4GKmK'
                            token={handleToken}
                            billingAddress
                            shippingAddress
                            name='Todos los Productos'
                            amount={totalPrice * 100}
                        ></StripeCheckout> 
                         <h6 className='text-center'
                        style={{marginTop: 7+'px'}}>OR</h6>
                        <button className='btn btn-secondary btn-md' 
                        onClick={()=>triggerModal()}>Efectivo</button>                                                                                                                                             
                    </div>                                    
                </div>
            )}
            {cartProducts.length < 1 && (
                <div className='container-fluid'>No products to show</div>
            ) }

            {showModal===true&&(
                <Modal TotalPrice={totalPrice} totalQty={totalQty}
                    hideModal={hideModal}
                />
            )}          
                            
        </>
    )
}